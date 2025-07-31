import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dodavanje proizvoda u košaricu
  const addToCart = (product) => {
    setCart((prevCart) => {
      const productIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.vrsta === product.vrsta && item.podvrsta === product.podvrsta
      );

      if (productIndex === -1) {
        return [...prevCart, { ...product, quantity: 1 }];
      } else {
        const updatedCart = [...prevCart];
        updatedCart[productIndex].quantity += 1;
        return updatedCart;
      }
    });
    setIsModalOpen(true);  // Otvori modal nakon dodavanja u košaricu
  };

  const increaseQuantity = (productId, vrsta, podvrsta) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === productId && item.vrsta === vrsta && item.podvrsta === podvrsta) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      return updatedCart;
    });
  };

  const decreaseQuantity = (productId, vrsta, podvrsta) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === productId && item.vrsta === vrsta && item.podvrsta === podvrsta) {
          if (item.quantity === 1) {
            return null;  // Uklanja proizvod ako količina padne na 0
          } else {
            return { ...item, quantity: item.quantity - 1 };
          }
        }
        return item;
      }).filter(item => item !== null);  // Filtrira uklonjene proizvode

      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <CartContext.Provider value={{ cart, addToCart, increaseQuantity, decreaseQuantity, clearCart, isModalOpen, closeModal }}>
      {children}
    </CartContext.Provider>
  );
};
