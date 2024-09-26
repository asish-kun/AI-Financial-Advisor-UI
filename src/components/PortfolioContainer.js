import React from 'react';
import Stock from './Stock'; // Assuming Stock component handles individual stock items

function PortfolioContainer({ stocks }) {
  return (
    <div className="portfolio">
      <h2>Your Portfolio</h2>
      <div className="stock-list">
        {stocks.length > 0 ? (
          stocks.map((stock) => (
            <Stock 
              key={stock.id} 
              stock={stock}
            />
          ))
        ) : (
          <p>No stocks in your portfolio yet.</p>
        )}
      </div>
    </div>
  );
}

export default PortfolioContainer;
