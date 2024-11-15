// Portfolio.js

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import {
  Select,
  SelectItem,
} from "../components/ui/Select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Send } from 'lucide-react';
import './Portfolio.css'; // Assuming you have a CSS file for styling

const Portfolio = () => {
  const [portfolioStocks, setPortfolioStocks] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [rankedNewsArticles, setRankedNewsArticles] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState("total-value");

  useEffect(() => {
    const storedPortfolio = JSON.parse(localStorage.getItem('portfolio')) || [];
    setPortfolioStocks(storedPortfolio);
  }, []);

  useEffect(() => {
    if (portfolioStocks.length > 0) {
      const dates = portfolioStocks[0].lastWeekData.map((data) => data.date);
      const initialPortfolioValue = portfolioStocks.reduce((sum, stock) => {
        const dayData = stock.lastWeekData[0];
        return sum + stock.shares * dayData.close;
      }, 0);

      const history = dates.map((date) => {
        let totalPortfolioValue = 0;
        const stockValues = {};
        portfolioStocks.forEach((stock) => {
          const dayData = stock.lastWeekData.find((data) => data.date === date);
          if (dayData) {
            const stockValue = stock.shares * dayData.close;
            totalPortfolioValue += stockValue;
            const initialStockValue = stock.shares * stock.lastWeekData[0].close;
            const stockPercentChange =
              ((stockValue - initialStockValue) / initialStockValue) * 100;
            stockValues[stock.symbol] = stockPercentChange.toFixed(2);
          }
        });
        const portfolioPercentChange =
          ((totalPortfolioValue - initialPortfolioValue) / initialPortfolioValue) * 100;
        return {
          date,
          portfolioValue: totalPortfolioValue.toFixed(2),
          portfolioPercentChange: portfolioPercentChange.toFixed(2),
          ...stockValues,
        };
      });
      setPortfolioHistory(history);
    }
  }, [portfolioStocks]);

  // Compute total current portfolio value
  const totalPortfolioValue = portfolioStocks.reduce((sum, stock) => {
    const latestPrice = stock.lastWeekData[stock.lastWeekData.length - 1]?.close || 0;
    return sum + stock.shares * latestPrice;
  }, 0);

  // Process stocks to include currentValue and today's change
  const processedStocks = portfolioStocks.map((stock) => {
    const todayData = stock.lastWeekData[stock.lastWeekData.length - 1];
    const latestPrice = todayData?.close;
    const purchasePrice = stock.purchasePrice;
    const priceChangePercent = latestPrice && purchasePrice
      ? ((latestPrice - purchasePrice) / purchasePrice) * 100
      : 0;

    const currentValue = stock.shares * (latestPrice || 0);
    return {
      ...stock,
      currentValue,
      latestPrice,
      priceChangePercent,
    };
  });

  // Sort stocks by current value in descending order
  const sortedStocks = processedStocks.sort((a, b) => b.currentValue - a.currentValue);

  // Pie Chart Colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Pie chart data processing
  const pieData = portfolioStocks.map((stock) => {
    const latestPrice = stock.lastWeekData[stock.lastWeekData.length - 1].close;
    const currentValue = stock.shares * latestPrice;
    return {
      name: stock.companyOverview.Name,
      value: currentValue,
      symbol: stock.symbol,
      holdings: stock.shares,
    };
  });

  const graphs = {
    "total-value": {
      title: "Total Portfolio Value Over Last Week",
      component: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={portfolioHistory}
            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          >
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value) => `$${parseFloat(value).toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, 'Total Portfolio Value']}
              domain={['auto', 'auto']}
            />
            <Line type="monotone" dataKey="portfolioValue" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )
    },
    "percentage-change": {
      title: "Total Portfolio Percentage Change Over Last Week",
      component: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={portfolioHistory}
            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Total Portfolio % Change']}
            />
            <Line
              type="monotone"
              dataKey="portfolioPercentChange"
              stroke="#82ca9d"
            />
          </LineChart>
        </ResponsiveContainer>
      )
    },
    "individual-stocks": {
      title: "Stock Performance Over Last Week (%)",
      component: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={portfolioHistory}
            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
            />
            {portfolioStocks.map((stock, index) => (
              <Line
                key={stock.symbol}
                type="monotone"
                dataKey={stock.symbol}
                stroke={COLORS[index % COLORS.length]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )
    }
  };

  function formatDate(dateString) {
    // Expected input format: '20241023T224500'
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(9, 11);
    const minute = dateString.substring(11, 13);
    const second = dateString.substring(13, 15);

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (userQuery.trim() === '') return;

    // Add user's message to the conversation
    setConversation((prevConversation) => [
      ...prevConversation,
      { role: 'user', message: userQuery.trim() },
    ]);

    // Prepare conversation history for the API
    const apiConversationHistory = conversation.map((msg) => ({
      [msg.role]: msg.message,
    }));

    // Call the API
    fetch('https://c96e-2601-41-c282-d680-e18b-2409-99d1-490c.ngrok-free.app/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: userQuery.trim(),
        conversation_history: apiConversationHistory,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        let assistantMessage = data.response || 'Sorry, I did not understand your question.';

        // Add assistant's response to the conversation
        setConversation((prevConversation) => [
          ...prevConversation,
          { role: 'assistant', message: assistantMessage },
        ]);
      })
      .catch((error) => {
        console.error('Error querying data:', error);
        alert('Error querying data. Please try again later.');
      });

    // Clear the input
    setUserQuery('');
  };

  const handleTextareaChange = (e) => setUserQuery(e.target.value);
  const handleChatToggle = () => setIsChatExpanded(!isChatExpanded);

  return (
    <div className="portfolio pt-16">
      <h1 className="text-2xl font-bold mb-4">Your Portfolio</h1>
      <h2 className="text-xl font-semibold mb-4">
        Current Portfolio Value: ${totalPortfolioValue.toFixed(2)}
      </h2>
      <div className="flex-container">
        {/* Portfolio Value Graph with Dropdown */}
        <Card className="graph-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{graphs[selectedGraph].title}</h2>
              <Select
                defaultValue={selectedGraph}
                onChange={(value) => setSelectedGraph(value)}
                className="dropdown-select"
              >
                <SelectItem value="total-value">Total Value</SelectItem>
                <SelectItem value="percentage-change">Percentage Change</SelectItem>
                <SelectItem value="individual-stocks">Individual Stock Performance</SelectItem>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              {graphs[selectedGraph].component}
            </div>
          </CardContent>
        </Card>

        {/* Stock Share Pie Chart */}
        <Card className="pie-chart-card">
          <CardHeader>
            <h2 className="text-lg font-semibold">Stock Share in Portfolio</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} labelLine={false} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    <div>
                      <strong>{name}</strong><br />
                      {`Holdings: ${pieData.find(d => d.name === name)?.holdings}`}
                      <br />
                      {`Value: $${parseFloat(value).toLocaleString()}`}
                      <br />
                      {'Performance: N/A'}
                    </div>
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolioStocks.length > 0 ? (
          <>
            {/* Stock Table (75%) */}
            <div className="stock-table" style={{ flex: '3' }}>
              <h2 className="text-lg font-semibold mt-4">Your Stocks</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Industry</th>
                      <th>Company Name</th>
                      <th>Quantity</th>
                      <th>Investment Date</th>
                      <th>Today's Change</th>
                      <th>Current Value</th>
                      <th>Predicted Price</th>
                      <th>Trading Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStocks.map((stock, index) => (
                      <tr key={index}>
                        <td>{stock.symbol}</td>
                        <td>{stock.companyOverview.Industry}</td>
                        <td>{stock.companyOverview.Name}</td>
                        <td>{stock.shares}</td>
                        <td>{stock.dateOfPurchase}</td>
                        <td className={stock.priceChangePercent >= 0 ? 'positive-change' : 'negative-change'}>
                          {stock.priceChangePercent >= 0 ? '▲' : '▼'} {(stock.priceChangePercent ?? 0).toFixed(2)}%
                        </td>
                        <td>${(stock.currentValue ?? 0).toFixed(2)}</td>
                        <td>{stock.predictedPrice ? `$${stock.predictedPrice.toFixed(2)}` : 'N/A'}</td>
                        <td>'N/A'</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* News Section */}
            <div className="news-section">
              <h2 className="text-lg font-semibold mt-4">Top News Articles</h2>
              {rankedNewsArticles.length > 0 ? (
                <div className="news-articles">
                  {rankedNewsArticles.map((article, index) => (
                    <div key={index} className="news-article">
                      <h3>{article.title}</h3>
                      <p><strong>Source:</strong> {article.source}</p>
                      <p><strong>Published:</strong> {formatDate(article.time_published)}</p>
                      <p><strong>Company:</strong> {article.companyName} ({article.symbol})</p>
                      <p><strong>Summary:</strong> {article.summary}</p>
                      <p><strong>Impact Score:</strong> {article.impact_score.toFixed(3)}</p>
                      <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No news articles available for your portfolio stocks.</p>
              )}
            </div>

          </>
        ) : (
          <p>You have not added any stocks to your portfolio yet.</p>
        )}
      </div>
      <div className={`chat-interface ${isChatExpanded ? 'expanded' : ''}`}>
        {isChatExpanded && (
          <>
            <button className="collapse-button" onClick={handleChatToggle} aria-label="Collapse chat">
              <FontAwesomeIcon icon={faChevronDown} />
            </button>

            <div className="chat-window">
              {conversation.map((chat, index) => (
                <div key={index} className={`chat-message ${chat.role}`}>
                  <div className="message">{chat.message}</div>
                </div>
              ))}
            </div>
          </>
        )}
        <form onSubmit={handleSubmit} className="chat-form">
          <div className="input-container">
            <textarea
              value={userQuery}
              onChange={handleTextareaChange}
              placeholder="Ask your Financial Advisor anything..."
              rows="1"
              className='chat-input'
            />
            <button type="submit" className="send-button">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        {!isChatExpanded && (
          <button className="collapse-button" onClick={handleChatToggle} aria-label="Expand chat">
            <FontAwesomeIcon icon={faChevronUp} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
