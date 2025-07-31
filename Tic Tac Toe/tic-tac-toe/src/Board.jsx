import React from "react";
import Square from "./Square";

const Board = ({ square, onClick, strikeClass, player, winner, reset }) => {
  return (
    <div className="text-center">
      <div className="d-flex flex-wrap justify-content-center" style={{ width: '300px', height: '300px', border: '4px solid black' }}>
        {square.map((value, index) => (
          <Square
            key={index}
            value={value}
            onClick={() => onClick(index)}
            className="border border-dark w-33 h-33"
            player={player}
          />
        ))}
        <div className={`absolute w-100 bg-orange-600 z-40 ${strikeClass}`}></div>
      </div>
      {winner && (
        <div className="mt-3">
          <h3>{winner === "draw" ? "It's a Tie!" : `Player ${winner} Wins!`}</h3>
        </div>
      )}
      <button onClick={reset} className="btn btn-primary mt-3">
        Reset Game
      </button>
    </div>
  );
};

export default Board;
