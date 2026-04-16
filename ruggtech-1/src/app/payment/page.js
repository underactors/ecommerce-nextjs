// app/payment/page.js - Using @paypal/react-paypal-js for proper Next.js integration
// IMPORTANT: First run: npm install @paypal/react-paypal-js
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser, useAuth, SignInButton } from '@clerk/nextjs';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import TrustBadges from '../components/TrustBadges';

// PayPal Client ID - LIVE
const PAYPAL_CLIENT_ID = 'ASHVkUdj2wnC54mNpkdfih3ejmBWQzSglCZoeF-MNI2_vx4RGlosX-5vJ3WfwPuQOzcxKa1nGM4XIFR_';

const PaymentPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const { cartItems, cartCount } = useCart();
  const [activeTab, setActiveTab] = useState('paypal');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [googlePayReady, setGooglePayReady] = useState(false);
  const [googlePayError, setGooglePayError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  const [shippingComplete, setShippingComplete] = useState(false);
  
  const googlePayClient = useRef(null);
  
  // Set client-side flag for Turbopack
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get promo code from session storage
  const getPromoCode = () => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('appliedPromoCode');
  };
  
  const getPromoDiscount = () => {
    if (typeof window === 'undefined') return 0;
    const discount = sessionStorage.getItem('promoDiscount');
    return discount ? parseFloat(discount) : 0;
  };

  // Calculate totals from cart (with safety checks)
  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const getSelectedShipping = () => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('selectedShipping');
    return stored ? JSON.parse(stored) : null;
  };

  const calculateShipping = () => {
    const selectedShipping = getSelectedShipping();
    if (selectedShipping) {
      return selectedShipping.amount;
    }
    return 0;
  };
  
  const calculateDiscount = () => {
    return calculateSubtotal() * getPromoDiscount();
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping() - calculateDiscount();
  };

  // Pre-fill shipping name from user
  useEffect(() => {
    if (user && !shippingAddress.fullName) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim()
      }));
    }
  }, [user]);

  // Validate shipping address
  const validateShipping = () => {
    const { fullName, phone, address, city, state, zipCode, country } = shippingAddress;
    return fullName && phone && address && city && state && zipCode && country;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setShippingComplete(true);
    }
  };

  // Generate order ID
  const generateOrderId = () => {
    return 'RUG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  // Save order to Sanity (now includes user info)
  const saveOrderToSanity = async (orderData) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          userId: user?.id,
          customerEmail: user?.emailAddresses?.[0]?.emailAddress || orderData.customerEmail,
          customerName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          customerPhone: user?.phoneNumbers?.[0]?.phoneNumber || orderData.shippingAddress?.phone || '',
          promoCode: getPromoCode() || '',
          discount: calculateDiscount(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to save order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  };

  // Send confirmation email
  const sendConfirmationEmail = async (orderData) => {
    try {
      const userEmail = user?.emailAddresses?.[0]?.emailAddress;
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userEmail || orderData.customerEmail,
          customerName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          orderId: orderData.orderId,
          items: orderData.items,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod,
          shippingAddress: orderData.shippingAddress
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Email sending failed:', errorData);
        return { success: false, error: errorData };
      }

      return await response.json();
    } catch (error) {
      console.warn('Error sending email:', error);
      return { success: false, error: error.message };
    }
  };

  // =====================================================
  // PAYPAL HANDLERS (using @paypal/react-paypal-js)
  // =====================================================
  
  const createPayPalOrder = (data, actions) => {
    console.log('Creating PayPal order...');
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    const total = calculateTotal();
    if (total <= 0) {
      throw new Error('Invalid order total');
    }

    return actions.order.create({
      purchase_units: [{
        amount: {
          value: total.toFixed(2),
          currency_code: 'USD',
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: calculateSubtotal().toFixed(2)
            },
            tax_total: {
              currency_code: 'USD', 
              value: calculateTax().toFixed(2)
            },
            shipping: {
              currency_code: 'USD',
              value: calculateShipping().toFixed(2)
            }
          }
        },
        items: cartItems.map(item => ({
          name: item.name.substring(0, 127),
          unit_amount: {
            currency_code: 'USD',
            value: item.price.toFixed(2)
          },
          quantity: item.quantity.toString()
        }))
      }],
      application_context: {
        shipping_preference: 'NO_SHIPPING'
      }
    });
  };

  const onPayPalApprove = async (data, actions) => {
    try {
      console.log('PayPal payment approved, capturing...');
      setLoading(true);
      
      const details = await actions.order.capture();
      console.log('PayPal payment captured:', details);
      
      const newOrderId = generateOrderId();
      const userEmail = user?.emailAddresses?.[0]?.emailAddress;
      
      const orderData = {
        orderId: newOrderId,
        customerEmail: userEmail || 'customer@example.com',
        paymentMethod: 'paypal',
        paymentDetails: {
          paypalTransactionId: details.id,
          paypalPayerId: details.payer.payer_id,
          paypalEmail: details.payer.email_address,
          paypalStatus: details.status
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          imageUrl: item.imageUrl || '',
          slug: item.slug?.current || item.slug || item.productSlug || '',
          contentType: item.contentType || item.category || '',
          color: item.color || ''
        })),
        shippingAddress: shippingAddress,
        shippingMethod: getSelectedShipping() || null,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        shipping: calculateShipping(),
        total: calculateTotal(),
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      console.log('Saving order to Sanity:', orderData.orderId);
      try {
        const saveResult = await saveOrderToSanity(orderData);
        console.log('Order saved:', saveResult);
        
        if (!saveResult || !saveResult.success) {
          throw new Error(saveResult?.error || 'Failed to save order');
        }
      } catch (saveError) {
        console.error('Failed to save order:', saveError);
        alert('Your payment was successful, but we had trouble saving your order. Please contact support with your PayPal transaction ID: ' + details.id);
        setOrderId(newOrderId);
        setOrderComplete(true);
        return;
      }
      
      console.log('Sending confirmation email...');
      try {
        const emailResult = await sendConfirmationEmail(orderData);
        console.log('Email result:', emailResult);
      } catch (emailError) {
        console.warn('Email sending failed (non-blocking):', emailError);
      }
      
      setOrderId(newOrderId);
      setOrderComplete(true);
      
    } catch (error) {
      console.error('PayPal payment processing error:', error);
      alert('Payment processing failed: ' + (error.message || 'Unknown error') + '. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const onPayPalError = (err) => {
    console.error('PayPal error:', err);
    setPaypalError('PayPal encountered an error. Please try again or use Google Pay.');
    setLoading(false);
  };

  const onPayPalCancel = (data) => {
    console.log('PayPal payment cancelled:', data);
    setLoading(false);
  };

  // =====================================================
  // GOOGLE PAY INTEGRATION
  // =====================================================
  
  const googlePayConfig = {
    environment: process.env.NEXT_PUBLIC_GOOGLE_PAY_ENVIRONMENT || 'TEST',
    merchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID || 'YOUR_MERCHANT_ID',
    merchantName: 'RUGGTECH',
    gateway: 'stripe',
    gatewayMerchantId: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  };

  const getGooglePayBaseRequest = () => ({
    apiVersion: 2,
    apiVersionMinor: 0
  });

  const getAllowedCardNetworks = () => ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'];
  const getAllowedCardAuthMethods = () => ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

  const getBaseCardPaymentMethod = () => ({
    type: 'CARD',
    parameters: {
      allowedAuthMethods: getAllowedCardAuthMethods(),
      allowedCardNetworks: getAllowedCardNetworks()
    }
  });

  const getTokenizationSpecification = () => ({
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: googlePayConfig.gateway,
      gatewayMerchantId: googlePayConfig.gatewayMerchantId
    }
  });

  const getCardPaymentMethod = () => ({
    ...getBaseCardPaymentMethod(),
    tokenizationSpecification: getTokenizationSpecification()
  });

  const getGoogleIsReadyToPayRequest = () => ({
    ...getGooglePayBaseRequest(),
    allowedPaymentMethods: [getBaseCardPaymentMethod()]
  });

  const getGooglePaymentDataRequest = () => ({
    ...getGooglePayBaseRequest(),
    allowedPaymentMethods: [getCardPaymentMethod()],
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: calculateTotal().toFixed(2),
      currencyCode: 'USD',
      countryCode: 'US'
    },
    merchantInfo: {
      merchantId: googlePayConfig.merchantId,
      merchantName: googlePayConfig.merchantName
    },
    callbackIntents: ['PAYMENT_AUTHORIZATION']
  });

  const initializeGooglePay = useCallback(async () => {
    if (!isClient || !window.google?.payments?.api) {
      return;
    }

    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: googlePayConfig.environment,
        paymentDataCallbacks: {
          onPaymentAuthorized: onPaymentAuthorized
        }
      });

      googlePayClient.current = paymentsClient;

      const isReadyToPayRequest = getGoogleIsReadyToPayRequest();
      const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);

      if (response.result) {
        setGooglePayReady(true);
        setGooglePayError(null);
        console.log('✅ Google Pay is ready');
      } else {
        setGooglePayError('Google Pay is not available on this device/browser');
        console.log('❌ Google Pay not available');
      }
    } catch (error) {
      console.error('Google Pay initialization error:', error);
      setGooglePayError('Failed to initialize Google Pay');
    }
  }, [isClient]);

  const onPaymentAuthorized = async (paymentData) => {
    try {
      const result = await processGooglePayment(paymentData);
      
      if (result.success) {
        return { transactionState: 'SUCCESS' };
      } else {
        return {
          transactionState: 'ERROR',
          error: {
            intent: 'PAYMENT_AUTHORIZATION',
            message: result.error || 'Payment failed',
            reason: 'PAYMENT_DATA_INVALID'
          }
        };
      }
    } catch (error) {
      return {
        transactionState: 'ERROR',
        error: {
          intent: 'PAYMENT_AUTHORIZATION',
          message: error.message,
          reason: 'PAYMENT_DATA_INVALID'
        }
      };
    }
  };

  const processGooglePayment = async (paymentData) => {
    try {
      const newOrderId = generateOrderId();
      const userEmail = user?.emailAddresses?.[0]?.emailAddress;

      const response = await fetch('/api/google-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentToken: paymentData.paymentMethodData.tokenizationData.token,
          orderId: newOrderId,
          amount: calculateTotal(),
          currency: 'USD',
          customerEmail: userEmail
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment processing failed');
      }

      const result = await response.json();

      const orderData = {
        orderId: newOrderId,
        customerEmail: userEmail || 'customer@example.com',
        paymentMethod: 'google_pay',
        paymentDetails: {
          googlePayTransactionId: result.transactionId,
          cardNetwork: paymentData.paymentMethodData.info?.cardNetwork,
          cardDetails: paymentData.paymentMethodData.info?.cardDetails,
          billingAddress: paymentData.paymentMethodData.info?.billingAddress
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          imageUrl: item.imageUrl || '',
          slug: item.slug?.current || item.slug || item.productSlug || '',
          contentType: item.contentType || item.category || '',
          color: item.color || ''
        })),
        shippingAddress: shippingAddress,
        shippingMethod: getSelectedShipping() || null,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        shipping: calculateShipping(),
        total: calculateTotal(),
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      console.log('Saving Google Pay order to Sanity:', orderData.orderId);
      try {
        const saveResult = await saveOrderToSanity(orderData);
        console.log('Google Pay order saved:', saveResult);
        
        if (!saveResult || !saveResult.success) {
          throw new Error(saveResult?.error || 'Failed to save order');
        }
      } catch (saveError) {
        console.error('Failed to save Google Pay order:', saveError);
        setOrderId(newOrderId);
        setOrderComplete(true);
        return { success: true, warning: 'Order saved with issues' };
      }
      
      console.log('Sending confirmation email for Google Pay order...');
      try {
        const emailResult = await sendConfirmationEmail(orderData);
        console.log('Google Pay email result:', emailResult);
      } catch (emailError) {
        console.warn('Email sending failed for Google Pay (non-blocking):', emailError);
      }

      setOrderId(newOrderId);
      setOrderComplete(true);

      return { success: true };
    } catch (error) {
      console.error('Google Pay processing error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleGooglePayClick = async () => {
    if (!googlePayClient.current) {
      setGooglePayError('Google Pay is not initialized');
      return;
    }

    setLoading(true);

    try {
      const paymentDataRequest = getGooglePaymentDataRequest();
      const paymentData = await googlePayClient.current.loadPaymentData(paymentDataRequest);
      console.log('Google Pay payment data:', paymentData);
    } catch (error) {
      if (error.statusCode === 'CANCELED') {
        console.log('Google Pay payment cancelled by user');
      } else {
        console.error('Google Pay error:', error);
        setGooglePayError('Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load Google Pay SDK
  useEffect(() => {
    if (!isClient) return;

    if (window.google?.payments?.api) {
      initializeGooglePay();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Google Pay SDK loaded');
      initializeGooglePay();
    };
    script.onerror = () => {
      console.error('❌ Failed to load Google Pay SDK');
      setGooglePayError('Failed to load Google Pay. Please use PayPal.');
    };

    document.head.appendChild(script);
  }, [isClient, initializeGooglePay]);

  // Show loading while Clerk is loading
  if (!isLoaded || !isClient) {
    return (
      <div className="container">
        <div style={{ 
          padding: '100px 0', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ fontSize: '48px', color: 'var(--primary)' }}>
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <div style={{ fontSize: '18px', color: 'var(--text-gray)' }}>
            Loading payment options...
          </div>
        </div>
      </div>
    );
  }

  // Show authentication required if not signed in
  if (!isSignedIn) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <div style={{
            background: 'var(--card-bg)',
            padding: '60px 40px',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '30px', color: 'var(--primary)' }}>
              🔒
            </div>
            <h1 style={{ 
              fontSize: '32px', 
              marginBottom: '20px', 
              color: 'var(--text-light)',
              fontWeight: '700'
            }}>
              Authentication Required
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: 'var(--text-gray)', 
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              Please sign in to your account to access the secure payment page and complete your purchase.
            </p>
            
            <div style={{ 
              background: 'var(--dark-bg)', 
              padding: '25px', 
              borderRadius: '12px',
              marginBottom: '40px',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <i className="fas fa-shield-alt"></i>
                Why do we require authentication?
              </h3>
              <div style={{ 
                color: 'var(--text-gray)', 
                fontSize: '14px',
                textAlign: 'left'
              }}>
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-check" style={{ color: 'var(--success)' }}></i>
                  <span>Secure order tracking and history</span>
                </div>
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-check" style={{ color: 'var(--success)' }}></i>
                  <span>Email confirmations and updates</span>
                </div>
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-check" style={{ color: 'var(--success)' }}></i>
                  <span>Fraud protection and security</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-check" style={{ color: 'var(--success)' }}></i>
                  <span>Customer support assistance</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <SignInButton mode="modal">
                <button style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: 'white',
                  padding: '18px 30px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                }}>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In to Continue
                </button>
              </SignInButton>

              <Link href="/" style={{
                color: 'var(--text-gray)',
                textDecoration: 'none',
                fontSize: '16px',
                padding: '15px',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.color = 'var(--text-gray)';
              }}>
                <i className="fas fa-arrow-left"></i>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Order confirmation component
  if (orderComplete) {
    return (
      <div className="container">
        <div className="order-confirmation" style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--card-bg)',
          borderRadius: '12px',
          margin: '40px auto',
          maxWidth: '600px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: '80px', color: 'var(--secondary)', marginBottom: '20px' }}>
            ✓
          </div>
          <h1 style={{ color: 'var(--secondary)', marginBottom: '20px', fontSize: '28px' }}>
            Order Confirmed!
          </h1>
          <p style={{ fontSize: '18px', marginBottom: '30px', color: 'var(--text-gray)', lineHeight: '1.6' }}>
            Thank you {user?.firstName || 'valued customer'} for your purchase. Your order has been successfully processed.
          </p>
          <div style={{ 
            background: 'var(--dark-bg)', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '30px',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ marginBottom: '10px', color: 'var(--primary)' }}>Order ID: {orderId}</h3>
            <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>
              A confirmation email has been sent to {user?.emailAddresses?.[0]?.emailAddress} with order details and tracking information.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--primary-dark)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--primary)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-home"></i> Continue Shopping
            </button>
            <button 
              onClick={() => window.location.href = '/orders'}
              style={{
                background: 'transparent',
                color: 'var(--primary)',
                padding: '15px 30px',
                border: '2px solid var(--primary)',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--primary)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--primary)';
              }}
            >
              <i className="fas fa-receipt"></i> View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Global Styles */}
      <style jsx global>{`
        :root {
          --primary: #3b82f6;
          --primary-dark: #2563eb;
          --secondary: #10b981;
          --dark-bg: #0f172a;
          --card-bg: #1e293b;
          --text-light: #f1f5f9;
          --text-gray: #94a3b8;
          --border: #334155;
          --accent: #f59e0b;
          --success: #10b981;
          --error: #ef4444;
          --google-pay: #4285f4;
          --transition: all 0.3s ease;
          --border-radius: 8px;
        }
        
        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 0 20px; 
        }
        .payment-page { 
          padding: 40px 0 80px; 
          min-height: 70vh; 
        }
        .payment-header { 
          margin-bottom: 40px; 
          text-align: center; 
        }
        .payment-header h1 { 
          font-size: 36px; 
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 15px;
          font-weight: 700;
        }
        .payment-container { 
          display: grid; 
          grid-template-columns: 1fr 400px; 
          gap: 40px; 
        }
        .payment-methods { 
          background: var(--card-bg); 
          border-radius: 12px; 
          padding: 40px; 
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .payment-tabs { 
          display: flex; 
          gap: 20px; 
          margin-bottom: 40px; 
          border-bottom: 2px solid var(--border); 
          padding-bottom: 25px; 
        }
        .tab { 
          flex: 1; 
          padding: 18px 25px; 
          text-align: center; 
          border-radius: var(--border-radius); 
          cursor: pointer; 
          background: var(--dark-bg); 
          border: 2px solid var(--border); 
          transition: var(--transition); 
          font-weight: 600;
          font-size: 16px;
          color: var(--text-light);
        }
        .tab:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .tab.active { 
          background: linear-gradient(135deg, var(--primary), var(--primary-dark)); 
          color: white; 
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        .tab-content { 
          display: none; 
        }
        .tab-content.active { 
          display: block; 
        }
        .order-summary { 
          background: var(--card-bg); 
          border-radius: 12px; 
          padding: 30px; 
          border: 1px solid var(--border); 
          position: sticky; 
          top: 120px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .cart-item-summary { 
          display: flex; 
          gap: 15px; 
          padding: 18px 0; 
          border-bottom: 1px solid var(--border);
          transition: var(--transition);
        }
        .cart-item-summary:hover {
          background: rgba(59, 130, 246, 0.05);
          margin: 0 -10px;
          padding: 18px 10px;
          border-radius: var(--border-radius);
        }
        .item-image { 
          width: 70px; 
          height: 70px; 
          background: var(--dark-bg); 
          border-radius: var(--border-radius); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 2px solid var(--border);
          transition: var(--transition);
        }
        .item-image:hover {
          transform: scale(1.05);
          border-color: var(--primary);
        }
        .item-image img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
        }
        .item-image i { 
          font-size: 32px; 
          color: var(--text-gray); 
        }
        .summary-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 15px; 
          font-size: 16px;
          padding: 8px 0;
          transition: var(--transition);
        }
        .summary-row:hover {
          background: rgba(59, 130, 246, 0.05);
          margin: 0 -15px 15px;
          padding: 8px 15px;
          border-radius: var(--border-radius);
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          font-size: 20px; 
          font-weight: 700; 
          margin: 30px 0; 
          padding: 25px 20px; 
          background: linear-gradient(135deg, var(--primary), var(--secondary)); 
          color: white; 
          border-radius: var(--border-radius);
        }
        .btn { 
          padding: 18px 25px; 
          border-radius: var(--border-radius); 
          font-weight: 600; 
          cursor: pointer; 
          transition: var(--transition); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 12px; 
          border: none;
          text-decoration: none;
          font-size: 16px;
        }
        .btn-primary { 
          background: linear-gradient(135deg, var(--primary), var(--primary-dark)); 
          color: white; 
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        .google-pay-btn { 
          background: #000; 
          color: white; 
          font-weight: 700; 
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          border: 1px solid #5f6368;
        }
        .google-pay-btn:hover {
          background: #202124;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }
        .loading-overlay { 
          position: fixed; 
          top: 0; 
          left: 0; 
          right: 0; 
          bottom: 0; 
          background: rgba(0,0,0,0.8); 
          backdrop-filter: blur(10px);
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          z-index: 9999;
        }
        .loading-spinner { 
          width: 60px; 
          height: 60px; 
          border: 6px solid var(--border); 
          border-top: 6px solid var(--primary); 
          border-radius: 50%; 
          animation: spin 1.2s linear infinite; 
          margin-bottom: 20px;
        }
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        .error-message { 
          background: linear-gradient(135deg, #dc2626, #b91c1c); 
          color: white; 
          padding: 20px; 
          border-radius: var(--border-radius); 
          margin: 20px 0; 
          text-align: center; 
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
        }
        .paypal-container {
          min-height: 180px;
          padding: 20px;
          border-radius: var(--border-radius);
          background: var(--dark-bg);
          border: 1px solid var(--border);
          transition: var(--transition);
        }
        
        /* User info display */
        .user-info {
          background: var(--dark-bg);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--border);
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
        }
        
        @media (max-width: 768px) { 
          .payment-container { 
            grid-template-columns: 1fr; 
            gap: 25px; 
          }
          .order-summary { 
            position: static; 
            order: -1; 
          }
          .payment-tabs { 
            flex-direction: column; 
            gap: 10px; 
          }
          .payment-methods {
            padding: 25px;
          }
          .tab {
            padding: 15px 20px;
          }
        }
      `}</style>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
            Processing your payment...
          </p>
        </div>
      )}

      <div className="container">
        <section className="payment-page">
          <div className="payment-header">
            <h1>💳 Secure Payment</h1>
            <p style={{ color: 'var(--text-gray)', fontSize: '18px' }}>
              Complete your purchase with our secure payment gateway. Your information is encrypted and protected.
            </p>
            
            {/* User Info Display */}
            <div className="user-info">
              <div className="user-avatar">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || 'User'} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>{user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div>
                <div style={{ color: 'var(--text-light)', fontWeight: '600', marginBottom: '5px' }}>
                  Welcome back, {user?.firstName || 'Valued Customer'}!
                </div>
                <div style={{ color: 'var(--text-gray)', fontSize: '14px' }}>
                  {user?.emailAddresses?.[0]?.emailAddress}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <button
                  onClick={() => signOut()}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-gray)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--error)';
                    e.target.style.color = 'var(--error)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.color = 'var(--text-gray)';
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i> Sign Out
                </button>
              </div>
            </div>
          </div>
          
          <TrustBadges />
          
          {/* Shipping Address Section */}
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--text-light)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-shipping-fast" style={{ color: 'var(--primary)' }}></i>
                Shipping Address
              </h2>
              {shippingComplete && (
                <button
                  onClick={() => setShippingComplete(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
              )}
            </div>
            
            {shippingComplete ? (
              <div style={{
                background: 'var(--dark-bg)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid var(--success)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '15px'
              }}>
                <i className="fas fa-check-circle" style={{ color: 'var(--success)', fontSize: '24px', marginTop: '5px' }}></i>
                <div style={{ color: 'var(--text-light)' }}>
                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>{shippingAddress.fullName}</div>
                  <div style={{ color: 'var(--text-gray)', marginBottom: '5px' }}>
                    <i className="fas fa-phone" style={{ marginRight: '8px' }}></i>{shippingAddress.phone}
                  </div>
                  <div style={{ color: 'var(--text-gray)' }}>
                    {shippingAddress.address}<br />
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                    {shippingAddress.country}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleShippingSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-gray)', fontSize: '14px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleShippingChange}
                      required
                      placeholder="John Doe"
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        background: 'var(--dark-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-light)',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-gray)', fontSize: '14px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleShippingChange}
                      required
                      placeholder="+1 (555) 123-4567"
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        background: 'var(--dark-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-light)',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-gray)', fontSize: '14px' }}>
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleShippingChange}
                      required
                      placeholder="123 Main Street"
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        background: 'var(--dark-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-light)',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-gray)', fontSize: '14px' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleShippingChange}
                      required
                      placeholder="New York"
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        background: 'var(--dark-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-light)',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-gray)', fontSize: '14px' }}>
                      State/Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleShippingChange}
                      required
                      placeholder="NY"
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        background: 'var(--dark-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-light)',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-gray)', fontSize: '14px' }}>
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={handleShippingChange}
                      required
                      placeholder="10001"
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        background: 'var(--dark-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-light)',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-gray)', fontSize: '14px' }}>
                      Country *
                    </label>
                    <select
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleShippingChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        background: 'var(--dark-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-light)',
                        fontSize: '16px'
                      }}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    marginTop: '25px',
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <i className="fas fa-check"></i> Continue to Payment
                </button>
              </form>
            )}
          </div>
          
          <div className="payment-container" style={{ opacity: shippingComplete ? 1 : 0.5, pointerEvents: shippingComplete ? 'auto' : 'none' }}>
            {!shippingComplete && (
              <div style={{
                background: 'var(--dark-bg)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
                border: '1px solid var(--warning)'
              }}>
                <i className="fas fa-info-circle" style={{ color: 'var(--warning)', marginRight: '10px' }}></i>
                <span style={{ color: 'var(--text-gray)' }}>Please complete shipping address above to proceed with payment</span>
              </div>
            )}
            <div className="payment-methods">
              <div className="payment-tabs">
                <div 
                  className={`tab ${activeTab === 'paypal' ? 'active' : ''}`}
                  onClick={() => setActiveTab('paypal')}
                >
                  <i className="fab fa-paypal"></i> PayPal
                </div>
                <div 
                  className={`tab ${activeTab === 'googlepay' ? 'active' : ''}`}
                  onClick={() => setActiveTab('googlepay')}
                >
                  <i className="fab fa-google"></i> Google Pay
                </div>
              </div>
              
              {/* PayPal Form - Using @paypal/react-paypal-js */}
              <div className={`tab-content ${activeTab === 'paypal' ? 'active' : ''}`}>
                {!cartItems || cartItems.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    background: 'var(--dark-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px', color: 'var(--text-gray)' }}>
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                    <h3 style={{ marginBottom: '15px', color: 'var(--text-light)' }}>Cart is Empty</h3>
                    <p style={{ color: 'var(--text-gray)', marginBottom: '25px' }}>
                      Add items to your cart to proceed with PayPal payment.
                    </p>
                   
                    <Link href="/"
                      className="btn btn-primary"
                      style={{ textDecoration: 'none', display: 'inline-flex' }}>
                      <i className="fas fa-shopping-bag"></i> Continue Shopping
                    </Link>
                  </div>
                ) : (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '15px', color: 'var(--primary)' }}>
                        <i className="fab fa-paypal"></i>
                      </div>
                      <h3 style={{ marginBottom: '10px', color: 'var(--text-light)' }}>Pay with PayPal</h3>
                      <p style={{ color: 'var(--text-gray)', marginBottom: '15px' }}>
                        Secure payment processing with PayPal&apos;s trusted platform
                      </p>
                      <div style={{ 
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white',
                        padding: '12px 25px',
                        borderRadius: '25px',
                        display: 'inline-block',
                        fontWeight: '700',
                        fontSize: '18px'
                      }}>
                        Total: ${calculateTotal().toFixed(2)} USD
                      </div>
                    </div>
                    
                    {paypalError && (
                      <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i> {paypalError}
                      </div>
                    )}
                    
                    <div style={{ 
                      background: 'var(--dark-bg)', 
                      padding: '25px', 
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      marginBottom: '25px'
                    }}>
                      <h4 style={{ marginBottom: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-shield-alt"></i> Why Choose PayPal?
                      </h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '15px',
                        color: 'var(--text-gray)',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fas fa-lock" style={{ color: 'var(--success)' }}></i>
                          <span>Bank-level security</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fas fa-credit-card" style={{ color: 'var(--success)' }}></i>
                          <span>Multiple payment methods</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fas fa-undo" style={{ color: 'var(--success)' }}></i>
                          <span>Buyer protection</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fas fa-globe" style={{ color: 'var(--success)' }}></i>
                          <span>Global acceptance</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* PayPal Buttons using @paypal/react-paypal-js */}
                    <div className="paypal-container">
                      <PayPalScriptProvider 
                        options={{ 
                          clientId: PAYPAL_CLIENT_ID,
                          currency: "USD",
                          intent: "capture",
                          "disable-funding": "credit",
                          "enable-funding": "venmo,card"
                        }}
                      >
                        <PayPalButtons
                          style={{
                            layout: 'vertical',
                            color: 'blue',
                            shape: 'rect',
                            label: 'paypal',
                            height: 45
                          }}
                          createOrder={createPayPalOrder}
                          onApprove={onPayPalApprove}
                          onError={onPayPalError}
                          onCancel={onPayPalCancel}
                        />
                      </PayPalScriptProvider>
                    </div>

                    <div style={{ 
                      textAlign: 'center', 
                      marginTop: '20px',
                      fontSize: '12px',
                      color: 'var(--text-gray)'
                    }}>
                      <p>
                        <i className="fas fa-info-circle"></i> 
                        You&apos;ll be redirected to PayPal to complete your payment securely
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Google Pay Form */}
              <div className={`tab-content ${activeTab === 'googlepay' ? 'active' : ''}`}>
                {!cartItems || cartItems.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    background: 'var(--dark-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px', color: 'var(--text-gray)' }}>
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                    <h3 style={{ marginBottom: '15px', color: 'var(--text-light)' }}>Cart is Empty</h3>
                    <p style={{ color: 'var(--text-gray)', marginBottom: '25px' }}>
                      Add items to your cart to proceed with Google Pay.
                    </p>
                  
                    <Link href="/"
                      className="btn btn-primary"
                      style={{ textDecoration: 'none', display: 'inline-flex' }}>
                      <i className="fas fa-shopping-bag"></i> Continue Shopping
                    </Link>
                  
                  </div>
                ) : (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '15px', color: '#4285f4' }}>
                        <i className="fab fa-google"></i>
                      </div>
                      <h3 style={{ marginBottom: '10px', color: 'var(--text-light)' }}>Pay with Google Pay</h3>
                      <p style={{ color: 'var(--text-gray)', marginBottom: '15px' }}>
                        Fast, simple checkout with cards saved to your Google Account
                      </p>
                      <div style={{ 
                        background: 'linear-gradient(135deg, #4285f4, #34a853)',
                        color: 'white',
                        padding: '12px 25px',
                        borderRadius: '25px',
                        display: 'inline-block',
                        fontWeight: '700',
                        fontSize: '18px'
                      }}>
                        Total: ${calculateTotal().toFixed(2)} USD
                      </div>
                    </div>

                    {googlePayError && (
                      <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i> {googlePayError}
                      </div>
                    )}

                    <button 
                      className="btn google-pay-btn" 
                      onClick={handleGooglePayClick}
                      disabled={loading || !googlePayReady}
                      style={{ 
                        width: '100%', 
                        fontSize: '18px',
                        padding: '20px',
                        position: 'relative',
                        opacity: (!googlePayReady || loading) ? 0.7 : 1
                      }}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> 
                          Processing Google Pay...
                        </>
                      ) : !googlePayReady ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> 
                          Loading Google Pay...
                        </>
                      ) : (
                        <>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Pay ${calculateTotal().toFixed(2)} with Google Pay
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="order-summary">
              <h2 style={{ 
                fontSize: '26px', 
                marginBottom: '25px', 
                paddingBottom: '20px', 
                borderBottom: '2px solid var(--border)',
                color: 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📋 Order Summary
              </h2>
              
              <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '25px', paddingRight: '5px' }}>
                {!cartItems || cartItems.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px', 
                    color: 'var(--text-gray)',
                    background: 'var(--dark-bg)',
                    borderRadius: '8px',
                    border: '1px dashed var(--border)'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '15px' }}>
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                    <p>Your cart is empty</p>
                
                    <Link href="/" style={{ 
                      color: 'var(--primary)', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600'}}>Start Shopping →</Link>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div key={item.id || `cart-item-${index}`} className="cart-item-summary">
                      <div className="item-image">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} />
                        ) : (
                          <i className={item.icon || 'fas fa-box'}></i>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          marginBottom: '8px', 
                          color: 'var(--text-light)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.name}
                        </div>
                        <div style={{ 
                          color: 'var(--text-gray)', 
                          fontSize: '14px', 
                          marginBottom: '8px' 
                        }}>
                          {item.color || item.brand} • Qty: {item.quantity}
                        </div>
                        <div style={{ 
                          fontWeight: '700', 
                          fontSize: '16px', 
                          color: 'var(--accent)' 
                        }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {cartItems && cartItems.length > 0 && (
                <>
                  <div className="summary-row">
                    <span style={{ color: 'var(--text-gray)', fontWeight: '500' }}>
                      <i className="fas fa-calculator"></i> Subtotal
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--text-light)' }}>
                      ${calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="summary-row">
                    <span style={{ color: 'var(--text-gray)', fontWeight: '500' }}>
                      <i className="fas fa-shipping-fast"></i> Shipping
                    </span>
                    <span style={{ 
                      fontWeight: '600', 
                      color: calculateShipping() === 0 ? 'var(--success)' : 'var(--text-light)' 
                    }}>
                      {calculateShipping() === 0 ? (
                        <>
                          <i className="fas fa-gift"></i> FREE
                        </>
                      ) : (
                        `${calculateShipping().toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="summary-row">
                    <span style={{ color: 'var(--text-gray)', fontWeight: '500' }}>
                      <i className="fas fa-receipt"></i> Tax (8%)
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--text-light)' }}>
                      ${calculateTax().toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="total-row">
                    <span>
                      <i className="fas fa-credit-card"></i> Total
                    </span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>

                  {/* Money-Back Guarantee Badge */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
                    border: '2px solid var(--primary)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🛡️</div>
                    <div style={{ color: 'var(--primary)', fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
                      30-Day Money-Back Guarantee
                    </div>
                    <div style={{ color: 'var(--text-gray)', fontSize: '13px', lineHeight: '1.5' }}>
                      Not satisfied? Return within 30 days for a full refund. No questions asked.
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    marginTop: '15px'
                  }}>
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                      <i className="fas fa-lock" style={{ color: 'var(--success)', fontSize: '20px' }}></i>
                      <div style={{ color: 'var(--text-gray)', fontSize: '11px', marginTop: '5px' }}>SSL Secure</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                      <i className="fas fa-truck" style={{ color: 'var(--primary)', fontSize: '20px' }}></i>
                      <div style={{ color: 'var(--text-gray)', fontSize: '11px', marginTop: '5px' }}>Fast Shipping</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                      <i className="fas fa-headset" style={{ color: 'var(--secondary)', fontSize: '20px' }}></i>
                      <div style={{ color: 'var(--text-gray)', fontSize: '11px', marginTop: '5px' }}>24/7 Support</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PaymentPage;