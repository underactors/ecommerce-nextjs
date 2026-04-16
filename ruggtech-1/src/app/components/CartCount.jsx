// components/CartCount.jsx
"use client";

import { useCart } from '../contexts/CartContext'; // Adjust path as needed

export default function CartCount() {
  const { getCartCount } = useCart();
  
  return (
    <span className="cart-count">{getCartCount()}</span>
  );
}

// Usage in your header/navigation:
// <CartCount /> instead of hardcoded cart count