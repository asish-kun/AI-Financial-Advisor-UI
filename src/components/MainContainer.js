// src/components/MainComponent.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MainComponent() {
  const [symbol, setSymbol] = useState('');
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const navigate = useNavigate();

  // Fetch top gainers and losers on component mount
  useEffect(() => {
    fetch('http://127.0.0.1:5000/stocks/top_movers')
      .then((response) => response.json())
      .then((data) => {
        if (data.top_gainers && data.top_losers) {
          setTopGainers(data.top_gainers.slice(0, 10)); // Get top 10 gainers
          setTopLosers(data.top_losers.slice(0, 10));   // Get top 10 losers
        } else {
          alert('No data found for top gainers or losers.');
        }
      })
      .catch((error) => {
        console.error('Error fetching top gainers and losers:', error);
        alert('Error fetching top gainers and losers. Please try again later.');
      });
  }, []);

  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(`/stock/${event}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Search bar */}
      <form onSubmit={handleSubmit}>
        <label>
          Stock Symbol:
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g., IBM"
          />
        </label>
        <button type="submit">Search</button>
      </form>

      {/* Display top gainers and losers */}
      <div>
        <h2>Top 10 Gainers</h2>
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Price (USD)</th>
              <th>Change (%)</th>
              <th>Change (USD)</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {topGainers.map((stock) => (
              <tr key={stock.ticker} onClick={() => handleStockClick(stock.ticker)}>
                <td>{stock.ticker}</td>
                <td>{stock.price}</td>
                <td>
                  {stock.change_percentage.includes('-') ? (
                    <span style={{ color: 'red' }}>
                      ↓ {stock.change_percentage}
                    </span>
                  ) : (
                    <span style={{ color: 'green' }}>
                      ↑ {stock.change_percentage}
                    </span>
                  )}
                </td>
                <td>{stock.change_amount}</td>
                <td>{stock.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Top 10 Losers</h2>
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Price (USD)</th>
              <th>Change (%)</th>
              <th>Change (USD)</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {topLosers.map((stock) => (
              <tr key={stock.ticker} onClick={() => handleStockClick(stock.ticker)}>
                <td>{stock.ticker}</td>
                <td>{stock.price}</td>
                <td>
                  {stock.change_percentage.includes('-') ? (
                    <span style={{ color: 'red' }}>
                      ↓ {stock.change_percentage}
                    </span>
                  ) : (
                    <span style={{ color: 'green' }}>
                      ↑ {stock.change_percentage}
                    </span>
                  )}
                </td>
                <td>{stock.change_amount}</td>
                <td>{stock.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MainComponent;
