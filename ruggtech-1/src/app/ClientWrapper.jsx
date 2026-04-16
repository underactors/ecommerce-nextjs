// app/ClientWrapper.jsx (or .tsx)
"use client";

import { useState, useEffect } from 'react';

export default function ClientWrapper({ children }) {
   const [cartCount, setCartCount] = useState(3);

  useEffect(() => {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeIcon = themeToggle?.querySelector('i');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      body.classList.add('light-theme');
      if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
    }
    
    const handleThemeToggle = () => {
      body.classList.toggle('light-theme');
      
      if (themeIcon) {
        if (body.classList.contains('light-theme')) {
          themeIcon.classList.remove('fa-moon');
          themeIcon.classList.add('fa-sun');
          localStorage.setItem('theme', 'light');
        } else {
          themeIcon.classList.remove('fa-sun');
          themeIcon.classList.add('fa-moon');
          localStorage.setItem('theme', 'dark');
        }
      }
    };
    
    if (themeToggle) {
      themeToggle.addEventListener('click', handleThemeToggle);
    }
    
    // Cart functionality
    const cartButtons = document.querySelectorAll('.cart-btn');
    const handleCartClick = function() {
      const cartCountEl = document.querySelector('.cart-count');
      if (cartCountEl) {
        const newCount = parseInt(cartCountEl.textContent) + 1;
        cartCountEl.textContent = newCount;
        setCartCount(newCount);
        
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Added';
        this.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
          this.innerHTML = originalText;
          this.style.backgroundColor = '';
        }, 2000);
      }
    };
    
    cartButtons.forEach(button => {
      button.addEventListener('click', handleCartClick);
    });
    
    return () => {
      if (themeToggle) {
        themeToggle.removeEventListener('click', handleThemeToggle);
      }
      cartButtons.forEach(button => {
        button.removeEventListener('click', handleCartClick);
      });
    };
  }, []);

  return children;
}