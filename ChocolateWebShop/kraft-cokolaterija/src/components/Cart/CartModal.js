import React from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './Cart.css';

const CartModal = () => {
  const { isModalOpen, closeModal } = useCart();
  const navigate = useNavigate();

  if (!isModalOpen) return null;  // Ako modal nije otvoren, ništa ne prikazuj

  const handleCloseModal = () => {
    closeModal();
  };

  const handleGoToCart = () => {
    navigate('/cart');
    closeModal();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <p>Proizvod je uspješno dodan u košaricu!</p>
        <button onClick={handleGoToCart}>Pogledajte košaricu</button>
        <button onClick={handleCloseModal}>Ne, hvala</button>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default CartModal;
