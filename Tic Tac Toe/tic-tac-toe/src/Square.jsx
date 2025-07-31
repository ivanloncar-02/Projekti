import React from "react";

const Square = ({ onClick, value, className, player }) => {
  let hoverClass = null;
  if (value == null && player != null) {
    hoverClass = `${player.toLowerCase()}-hover`;
  }
  return (
    <button
      onClick={onClick}
      className={`btn btn-outline-primary w-33 h-33 text-5xl ${className} ${hoverClass}`}
      
      style={{ flex: '1 0 33%',
        transform: 'none', // Prevents scaling on click
        transition: 'none' // Disable any transitions that might affect size
       }} // Ensure square takes up 1/3 of the space
    >
      {value}
    </button>
  );
};

export default Square;
