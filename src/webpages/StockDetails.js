import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createChart } from 'lightweight-charts';
import './StockDetails.css'; // Import the CSS file
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function StockDetails() {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [companyOverview, setCompanyOverview] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [insiderTransactions, setInsiderTransactions] = useState([]);
  const [timeFrame, setTimeFrame] = useState('daily');
  const chartContainerRef = useRef();

  const BASE_URL = 'http://127.0.0.1:5000'; // Update the URL if necessary

  // Fetch global quote for current price and today's stats
  useEffect(() => {
    fetch(`${BASE_URL}/stocks/quote?symbol=${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        if (data['Global Quote']) {
          const quoteData = data['Global Quote'];
          setTodayStats({
            currentPrice: parseFloat(quoteData['05. price']),
            openPrice: parseFloat(quoteData['02. open']),
            highPrice: parseFloat(quoteData['03. high']),
            lowPrice: parseFloat(quoteData['04. low']),
            previousClose: parseFloat(quoteData['08. previous close']),
            change: parseFloat(quoteData['09. change']),
            changePercent: quoteData['10. change percent'],
          });
        } else {
          setTodayStats(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching global quote data:', error);
        alert('Error fetching data. Please try again later.');
      });
  }, [symbol]);

  // Fetch company overview
  useEffect(() => {
    fetch(`${BASE_URL}/stocks/overview?symbol=${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.Symbol) {
          setCompanyOverview(data);
        } else {
          setCompanyOverview(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching company overview:', error);
        alert('Error fetching company data. Please try again later.');
      });
  }, [symbol]);

  // Fetch financial performance data
  useEffect(() => {
    fetch(`${BASE_URL}/stocks/income_statement?symbol=${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.quarterlyReports) {
          setFinancialData(data.quarterlyReports.slice(0, 4)); // Get latest 4 quarters
        } else {
          setFinancialData(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching financial data:', error);
        alert('Error fetching financial data. Please try again later.');
      });
  }, [symbol]);

  // Fetch news and sentiments
  useEffect(() => {
    fetch(`${BASE_URL}/stocks/news?symbol=${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.feed && data.feed.length > 0) {
          setNewsData(data.feed.slice(0, 5)); // Get top 5 news articles
        } else {
          setNewsData([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching news data:', error);
        alert('Error fetching news data. Please try again later.');
      });
  }, [symbol]);

  // Fetch insider transactions
  useEffect(() => {
    fetch(`${BASE_URL}/stocks/insider_transactions?symbol=${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.transactions && data.transactions.length > 0) {
          setInsiderTransactions(data.transactions.slice(0, 5)); // Get latest 5 transactions
        } else {
          setInsiderTransactions([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching insider transactions:', error);
        alert('Error fetching insider transactions. Please try again later.');
      });
  }, [symbol]);

  // Fetch time series data for the chart
  useEffect(() => {
    let functionType = '';
    if (timeFrame === 'daily') {
      functionType = 'TIME_SERIES_DAILY';
    } else if (timeFrame === 'weekly') {
      functionType = 'TIME_SERIES_WEEKLY';
    } else if (timeFrame === 'monthly') {
      functionType = 'TIME_SERIES_MONTHLY';
    }

    fetch(`${BASE_URL}/stocks/time_series?symbol=${symbol}&function=${functionType}`)
      .then((response) => response.json())
      .then((data) => {
        let timeSeriesKey = '';
        if (timeFrame === 'daily') {
          timeSeriesKey = 'Time Series (Daily)';
        } else if (timeFrame === 'weekly') {
          timeSeriesKey = 'Weekly Time Series';
        } else if (timeFrame === 'monthly') {
          timeSeriesKey = 'Monthly Time Series';
        }

        if (data[timeSeriesKey]) {
          const timeSeries = data[timeSeriesKey];
          const dates = Object.keys(timeSeries).sort();
          const processedData = dates.map((date) => ({
            date: date,
            open: parseFloat(timeSeries[date]['1. open']),
            high: parseFloat(timeSeries[date]['2. high']),
            low: parseFloat(timeSeries[date]['3. low']),
            close: parseFloat(timeSeries[date]['4. close']),
            volume: parseInt(timeSeries[date]['5. volume'], 10),
          }));
          setStockData(processedData);
        } else {
          alert('No data found for this stock.');
          setStockData(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching stock data:', error);
        alert('Error fetching data. Please try again later.');
      });
  }, [symbol, timeFrame]);

  // Fetch news data
  useEffect(() => {
    fetch(`${BASE_URL}/stocks/news?symbol=${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.feed && data.feed.length > 0) {
          setNewsData(data.feed.slice(0, 5)); // Get top 5 news articles
        } else {
          setNewsData([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching news data:', error);
        alert('Error fetching news data. Please try again later.');
      });
  }, [symbol]);

  // Adjusted chart creation to ensure responsive width and height
  useEffect(() => {
    if (stockData && chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';

      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
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

      const chartData = stockData.map((dataPoint) => ({
        time: dataPoint.date,
        value: dataPoint.close,
      }));

      lineSeries.setData(chartData);

      // Handle window resize
      const handleResize = () => {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      };

      window.addEventListener('resize', handleResize);

      // Clean up on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [stockData]);

  // Mock scores for Buy/Sell (you can replace these with real data)
  const buyScore = 76;
  const sellScore = 24;

  // Function to determine color based on score
  const getScoreColor = (score) => {
    if (score <= 33) return '#f44336'; // Red
    if (score <= 66) return '#ffeb3b'; // Yellow
    return '#4caf50'; // Green
  };

  return (
    <div className="stock-details-container">
      {/* Price and Score Section */}
      <div className="price-and-score">
        {/* Price Details */}
        <div className="price-details">
          {todayStats ? (
            <>
              <h2>{symbol}</h2>
              <p>
                Current Price: <strong>${todayStats.currentPrice.toFixed(2)}</strong>
              </p>
              <p>Open Price: ${todayStats.openPrice.toFixed(2)}</p>
              <p>High Price: ${todayStats.highPrice.toFixed(2)}</p>
              <p>Low Price: ${todayStats.lowPrice.toFixed(2)}</p>
              <p>Previous Close: ${todayStats.previousClose.toFixed(2)}</p>
              <p className={todayStats.change >= 0 ? 'positive-change' : 'negative-change'}>
                Change: ${todayStats.change.toFixed(2)} ({todayStats.changePercent})
              </p>
            </>
          ) : (
            <p>Today's statistics are not available.</p>
          )}
        </div>

        {/* Buy/Sell Score Section */}
        <div className="score-section">
          <h3>Buy/Sell Score</h3>
          <div className="score-charts">
            <div className="score-chart">
              <CircularProgressbar
                value={buyScore}
                text={`Buy ${buyScore}%`}
                styles={buildStyles({
                  pathColor: getScoreColor(buyScore),
                  textColor: '#333',
                  trailColor: '#ddd',
                })}
              />
            </div>
            <div className="score-chart">
              <CircularProgressbar
                value={sellScore}
                text={`Sell ${sellScore}%`}
                styles={buildStyles({
                  pathColor: getScoreColor(sellScore),
                  textColor: '#333',
                  trailColor: '#ddd',
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Company Overview */}
      <div className="chart-and-overview">
        <div className="chart-container" ref={chartContainerRef}></div>
        {companyOverview ? (
          <div className="company-overview">
            <h3>About {companyOverview.Name}</h3>
            <img
              src={companyOverview.logoUrl}
              alt={`${companyOverview.Name} logo`}
              className="company-logo"
            />
            <p>{companyOverview.Description}</p>
            <p>Industry: {companyOverview.Industry}</p>
            <p>Market Cap: ${Number(companyOverview.MarketCapitalization).toLocaleString()}</p>
            <p>P/E Ratio: {companyOverview.PERatio}</p>
          </div>
        ) : (
          <p>Company overview is not available.</p>
        )}
      </div>

      {/* Financial Performance */}
      {financialData ? (
        <div className="financial-performance">
          <h3>Financial Performance (Quarterly)</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fiscal Date Ending</th>
                  <th>Total Revenue</th>
                  <th>Gross Profit</th>
                  <th>Net Income</th>
                </tr>
              </thead>
              <tbody>
                {financialData.map((report, index) => (
                  <tr key={index}>
                    <td>{report.fiscalDateEnding}</td>
                    <td>${Number(report.totalRevenue).toLocaleString()}</td>
                    <td>${Number(report.grossProfit).toLocaleString()}</td>
                    <td>${Number(report.netIncome).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>Financial data is not available.</p>
      )}

      {/* News Information Section */}
      {newsData.length > 0 ? (
        <div className="news-section">
          <h3>Latest News</h3>
          <ul>
            {newsData.map((newsItem, index) => (
              <li key={index}>
                <a href={newsItem.url} target="_blank" rel="noopener noreferrer">
                  {newsItem.title}
                </a>
                <p>{newsItem.summary}</p>
                <p><small>{new Date(newsItem.publishedDate).toLocaleString()}</small></p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No recent news available.</p>
      )}

      {/* Insider Transactions */}
      {insiderTransactions.length > 0 ? (
        <div className="insider-transactions">
          <h3>Insider Transactions</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Director</th>
                  <th>Relation</th>
                  <th>Transaction Type</th>
                  <th>Shares</th>
                  <th>Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {insiderTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{transaction.Director}</td>
                    <td>{transaction.Relation}</td>
                    <td>{transaction.TransactionType}</td>
                    <td>{transaction.Shares}</td>
                    <td>${transaction.Price}</td>
                    <td>{transaction.TransactionDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>No recent insider transactions available.</p>
      )}
    </div>
  );
}

export default StockDetails;
