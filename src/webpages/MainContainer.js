// src/components/MainComponent.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createChart } from 'lightweight-charts';
import './MainContainer.css'

function MainComponent() {
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [mostActive, setMostActive] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const chartContainerRef = useRef();
  const textareaRef = useRef(null);
  const chatWindowRef = useRef(null);

  const navigate = useNavigate();

  // Fetch top gainers, losers, and most active on component mount
  useEffect(() => {
    fetch('http://127.0.0.1:5000/stocks/top_movers')
      .then((response) => response.json())
      .then((data) => {
        if (data.top_gainers && data.top_losers && data.most_active) {
          setTopGainers(data.top_gainers.slice(0, 10)); // Get top 10 gainers
          setTopLosers(data.top_losers.slice(0, 10));   // Get top 10 losers
          setMostActive(data.most_active.slice(0, 10)); // Get top 10 most active
          setSelectedSymbol(data.most_active[0].ticker); // Set initial symbol for the chart
        } else {
          alert('No data found for top gainers, losers, or most active.');
        }
      })
      .catch((error) => {
        console.error('Error fetching top movers:', error);
        alert('Error fetching top movers. Please try again later.');
      });
  }, []);

  // Fetch and display the chart data for the selected symbol
  useEffect(() => {
    if (selectedSymbol) {
      fetch(`http://127.0.0.1:5000/stocks/daily?symbol=${selectedSymbol}&outputsize=compact`)
        .then((response) => response.json())
        .then((data) => {
          if (data['Time Series (Daily)']) {
            const timeSeries = data['Time Series (Daily)'];
            const dates = Object.keys(timeSeries).sort();
            const chartData = dates.map((date) => ({
              time: date,
              value: parseFloat(timeSeries[date]['4. close']),
            }));

            // Create the chart
            if (chartContainerRef.current) {
              chartContainerRef.current.innerHTML = '';

              const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth,
                height: 400,
                layout: {
                  backgroundColor: '#ffffff',
                  textColor: '#000000',
                },
                grid: {
                  vertLines: {
                    color: '#e1e1e1',
                  },
                  horzLines: {
                    color: '#e1e1e1',
                  },
                },
                crosshair: {
                  mode: 1,
                },
                rightPriceScale: {
                  borderColor: '#cccccc',
                },
                timeScale: {
                  borderColor: '#cccccc',
                  timeVisible: true,
                  secondsVisible: false,
                },
              });

              const lineSeries = chart.addLineSeries({
                color: '#2196F3',
                lineWidth: 2,
              });

              lineSeries.setData(chartData);

              // Handle window resize
              const handleResize = () => {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
              };

              window.addEventListener('resize', handleResize);

              // Clean up on unmount
              return () => {
                window.removeEventListener('resize', handleResize);
                chart.remove();
              };
            }
          } else {
            alert('No data found for this stock.');
          }
        })
        .catch((error) => {
          console.error('Error fetching stock data:', error);
          alert('Error fetching data. Please try again later.');
        });
    }
  }, [selectedSymbol]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleStockClick = (symbol) => {
    navigate(`/stocks/${symbol}`); // Navigate to StockDetails component
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (userQuery.trim() !== '') {
      // Add user's message to the conversation
      const newConversation = [...conversation, { sender: 'user', message: userQuery.trim() }];

      // Send POST request to the /query endpoint
      fetch('http://127.0.0.1:5000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery.trim() }),
      })
        .then((response) => response.json())
        .then((data) => {
          let assistantMessage = '';

          // Check if documents are present in the response
          if (data.documents && data.documents.length > 0) {
            // Loop through each array of documents
            data.documents.forEach((docArray) => {
              docArray.forEach((doc) => {
                try {
                  // Parse the JSON string in each document
                  const parsedDoc = JSON.parse(doc);
                  // Check if 'Meta Data' exists in the parsed document
                  if (parsedDoc['Meta Data']) {
                    const metaData = parsedDoc['Meta Data'];
                    assistantMessage += `Information: ${metaData['1. Information']}\n`;
                    assistantMessage += `Symbol: ${metaData['2. Symbol']}\n`;
                    assistantMessage += `Last Refreshed: ${metaData['3. Last Refreshed']}\n`;
                    assistantMessage += `Output Size: ${metaData['4. Output Size']}\n`;
                    assistantMessage += `Time Zone: ${metaData['5. Time Zone']}\n\n`;
                  }
                } catch (e) {
                  console.error('Error parsing document:', e);
                }
              });
            });
          } else {
            assistantMessage = 'Sorry, I did not understand your question.';
          }

          // Add assistant's message to the conversation
          setConversation([...newConversation, { sender: 'assistant', message: assistantMessage }]);
        })
        .catch((error) => {
          console.error('Error querying data:', error);
          alert('Error querying data. Please try again later.');
        });

      // Clear the input
      setUserQuery('');
    }
  };

  const handleTextareaChange = (e) => {
    setUserQuery(e.target.value);

    // Reset height to auto to calculate scrollHeight correctly
    textareaRef.current.style.height = 'auto';

    // Set height to scrollHeight, limited to maxHeight (6 lines)
    const maxHeight = 6 * 20; // Assuming line-height is 20px
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      maxHeight
    )}px`;
  };

  return (
    <div className="main-container">
      {/* Chart */}
      <div ref={chartContainerRef} className="chart-container"></div>

      {/* Display top gainers, losers, and most active */}
      <div className="lists-container">
        {/* Top Gainers */}
        <div className="list">
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
                      <span className="negative-change">
                        ↓ {stock.change_percentage}
                      </span>
                    ) : (
                      <span className="positive-change">
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

        {/* Top Losers */}
        <div className="list">
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
                      <span className="negative-change">
                        ↓ {stock.change_percentage}
                      </span>
                    ) : (
                      <span className="positive-change">
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

        {/* Most Active */}
        <div className="list">
          <h2>Top 10 Most Active</h2>
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
              {mostActive.map((stock) => (
                <tr key={stock.ticker} onClick={() => handleStockClick(stock.ticker)}>
                  <td>{stock.ticker}</td>
                  <td>{stock.price}</td>
                  <td>
                    {stock.change_percentage.includes('-') ? (
                      <span className="negative-change">
                        ↓ {stock.change_percentage}
                      </span>
                    ) : (
                      <span className="positive-change">
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

      {/* Conversation Chat */}
      <div className="chat-window" ref={chatWindowRef}>
        {conversation.map((chat, index) => (
          <div key={index} className={`chat-message ${chat.sender}`}>
            <div className="message" style={{ whiteSpace: 'pre-wrap' }}>{chat.message}</div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={userQuery}
            onChange={handleTextareaChange}
            placeholder="Hey I'm your Financial Advisor, feel free to ask me any questions you have..."
            rows="1"
            style={{ resize: 'none', overflow: 'hidden', maxHeight: '120px', width: "100%" }}
          />
          <button type="submit" className="send-button">
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;
