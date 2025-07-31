import React from 'react';
import { useCart } from './CartContext';

const Cart = () => {
  const { cart, increaseQuantity, decreaseQuantity, clearCart } = useCart();

  return (
    <div>
      <h2>Košarica</h2>
      {cart.length === 0 ? (
        <p>Košarica je prazna.</p>
      ) : (
        <ul>
          {cart.map((product) => (
            <li key={product.id}>
              {product.name} - {product.quantity} kom
              <div>
                <button onClick={() => increaseQuantity(product.id, product.vrsta, product.podvrsta)}>
                  Povećaj
                </button>
                <button onClick={() => decreaseQuantity(product.id, product.vrsta, product.podvrsta)}>
                  Smanji
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Dodajemo gumb za kupovinu koji briše sve iz košarice */}
      {cart.length > 0 && (
        <button onClick={clearCart}>Kupi</button>
      )}
    </div>
  );
};

export default Cart;
