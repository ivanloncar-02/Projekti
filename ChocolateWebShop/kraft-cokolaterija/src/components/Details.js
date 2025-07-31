import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from './Cart/CartContext';
import { getProductDetails } from '../services/api';

const Details = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDetails = await getProductDetails(id);
        setProduct(productDetails);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  if (loading) return <div>Učitavanje...</div>;
  if (!product) return <div>Proizvod nije pronađen.</div>;

  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleAddToCart}>Dodaj u košaricu</button>
    </div>
  );
};

export default Details;
