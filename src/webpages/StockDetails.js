import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createChart } from 'lightweight-charts';
import './StockDetails.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ReactComponent as AddToPortfolioIcon } from '../assets/add-to-portfolio.svg';
import { ReactComponent as CheckmarkIcon } from '../assets/checkmark.svg';
import AddToPortfolioDialog from '../components/AddToPortfolioDialog';

function StockDetails() {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [companyOverview, setCompanyOverview] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [insiderTransactions, setInsiderTransactions] = useState([]);
  const [timeFrame, setTimeFrame] = useState('1D');
  const chartContainerRef = useRef();
  const [lastWeekData, setLastWeekData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [financialView, setFinancialView] = useState('quarterly');
  const [isAdded, setIsAdded] = useState(false);
  const elementRef = useRef(null);
  const navigate = useNavigate();

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleAddToPortfolio = () => {
    openDialog();
    setIsAdded(true);
  };

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
        if (data.quarterlyReports && data.annualReports) {
          setFinancialData({
            quarterly: data.quarterlyReports.slice(0, 4),
            annual: data.annualReports.slice(0, 3),
          });
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
          setNewsData(data.feed.slice(0, 5));
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
          setInsiderTransactions(data.transactions.slice(0, 5));
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

  // Adjusted chart creation to ensure responsive width and height
  useEffect(() => {
    if (stockData && chartContainerRef.current) {
      chartContainerRef.current.innerHTML = ''; // Clear previous chart

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

      const chartData = stockData.map((dataPoint) => ({
        time: dataPoint.date,
        value: dataPoint.close,
      }));

      lineSeries.setData(chartData);

      // Add volume series
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        lineWidth: 2,
        priceFormat: {
          type: 'volume',
        },
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = stockData.map((dataPoint) => ({
        time: dataPoint.date,
        value: dataPoint.volume,
        color: dataPoint.close > dataPoint.open ? '#26a69a' : '#ef5350',
      }));

      volumeSeries.setData(volumeData);

      // Tooltip
      const toolTip = document.createElement('div');
      toolTip.className = 'chart-tooltip';
      chartContainerRef.current.appendChild(toolTip);

      chart.subscribeCrosshairMove((param) => {
        if (
          !param.point ||
          !param.time ||
          param.point.x < 0 ||
          param.point.y < 0
        ) {
          toolTip.style.display = 'none';
          return;
        }
        const price = param.seriesPrices.get(lineSeries);
        toolTip.style.left = param.point.x + 'px';
        toolTip.style.top = param.point.y + 'px';
        toolTip.style.display = 'block';
        toolTip.innerHTML = `Price: $${price.toFixed(2)}`;
      });

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

  return (
    <div className="stock-details-container">
      <div className="price-score-portfolio-row">
        {/* Price Details */}
        <div className="price-card">
          {todayStats ? (
            <>
              <h2>{symbol}</h2>
              <div className="price-info">
                <div className="current-price">
                  <span>Current Price</span>
                  <strong>${todayStats.currentPrice.toFixed(2)}</strong>
                </div>
                <div className="price-change">
                  <span
                    className={`change-badge ${todayStats.change >= 0 ? 'positive' : 'negative'}`}
                  >
                    {todayStats.change >= 0 ? '+' : '-'}$
                    {Math.abs(todayStats.change).toFixed(2)} ({todayStats.changePercent})
                  </span>
                </div>
              </div>
              <div className="additional-stats">
                <div className="stat-item">
                  <span>52 Week High</span>
                  <strong>
                    $
                    {companyOverview && companyOverview['52WeekHigh']
                      ? parseFloat(companyOverview['52WeekHigh']).toFixed(2)
                      : 'N/A'}
                  </strong>
                </div>
                <div className="stat-item">
                  <span>52 Week Low</span>
                  <strong>
                    $
                    {companyOverview && companyOverview['52WeekLow']
                      ? parseFloat(companyOverview['52WeekLow']).toFixed(2)
                      : 'N/A'}
                  </strong>
                </div>
                <div className="stat-item">
                  <span>Market Cap</span>
                  <strong>
                    $
                    {companyOverview && companyOverview['MarketCapitalization']
                      ? Number(companyOverview['MarketCapitalization']).toLocaleString()
                      : 'N/A'}
                  </strong>
                </div>
              </div>
              <div className="other-stats">
                <div className="stat-item">
                  <span>Open Price</span>
                  <strong>${todayStats.openPrice.toFixed(2)}</strong>
                </div>
                <div className="stat-item">
                  <span>High Price</span>
                  <strong>${todayStats.highPrice.toFixed(2)}</strong>
                </div>
                <div className="stat-item">
                  <span>Low Price</span>
                  <strong>${todayStats.lowPrice.toFixed(2)}</strong>
                </div>
                <div className="stat-item">
                  <span>Previous Close</span>
                  <strong>${todayStats.previousClose.toFixed(2)}</strong>
                </div>
              </div>
            </>
          ) : (
            <p>Today's statistics are not available.</p>
          )}
        </div>

        {/* Buy/Sell Score Section */}
        <div className="score-section">
          <h3>Buy/Sell Score</h3>
          <div className="score-chart">
            <CircularProgressbar
              value={buyScore}
              text={`${buyScore > sellScore ? 'Buy' : 'Sell'} ${buyScore > sellScore ? buyScore : sellScore
                }%`}
              styles={buildStyles({
                pathColor: buyScore > sellScore ? '#4caf50' : '#f44336',
                textColor: '#333',
                trailColor: '#ddd',
              })}
            />
          </div>
          <button className="score-explanation-button">
            {buyScore > sellScore ? 'Why Buy?' : 'Why Sell?'}
          </button>
        </div>

        {/* Add to Portfolio Button */}
        <div className="add-to-portfolio-container">
          <button className="add-to-portfolio-button" onClick={handleAddToPortfolio}>
            {isAdded ? <CheckmarkIcon /> : <AddToPortfolioIcon />}
            {isAdded ? 'Added to Portfolio' : 'Add to Portfolio'}
          </button>
        </div>
      </div>

      {/* AddToPortfolioDialog Component */}
      {isDialogOpen && (
        <AddToPortfolioDialog
          symbol={symbol}
          currentPrice={todayStats ? todayStats.currentPrice : 0}
          lastWeekData={lastWeekData}
          companyOverview={companyOverview}
          financialData={financialData}
          newsData={newsData}
          onClose={closeDialog}
        />
      )}

      {/* Chart and Company Overview */}
      <div className="chart-and-overview">
        {/* Timeframe Buttons */}
        <div className="chart-type-buttons">
          <button onClick={() => setTimeFrame('1D')}>1D</button>
          <button onClick={() => setTimeFrame('1W')}>1W</button>
          <button onClick={() => setTimeFrame('1M')}>1M</button>
          <button onClick={() => setTimeFrame('1Y')}>1Y</button>
          <button onClick={() => setTimeFrame('Max')}>Max</button>
        </div>

        {/* Chart */}
        <div className="chart-container" ref={chartContainerRef}></div>

        {/* Company Overview */}
        {companyOverview ? (
          <div className="company-overview">
            <h3>About {companyOverview.Name}</h3>
            <img
              src={companyOverview.logoUrl}
              alt={`${companyOverview.Name} logo`}
              className="company-logo"
            />
            <p>
              {isDescriptionExpanded
                ? companyOverview.Description
                : `${companyOverview.Description.substring(0, 200)}... `}
              <button
                className="expand-button"
                onClick={() =>
                  setIsDescriptionExpanded(!isDescriptionExpanded)
                }
              >
                {isDescriptionExpanded ? 'Show Less' : 'Read More'}
              </button>
            </p>
            <div className="company-details">
              <p>Sector: {companyOverview.Sector}</p>
              <p>Industry: {companyOverview.Industry}</p>
              <p>
                Dividend Yield: {companyOverview.DividendYield || 'N/A'}
              </p>
              <p>EPS: {companyOverview.EPS || 'N/A'}</p>
              <p>
                Market Cap: $
                {Number(companyOverview.MarketCapitalization).toLocaleString()}
              </p>
              <p>P/E Ratio: {companyOverview.PERatio}</p>
            </div>
          </div>
        ) : (
          <p>Company overview is not available.</p>
        )}
      </div>

      {/* Financial Performance */}
      {financialData ? (
        <div className="financial-performance">
          <h3>Financial Performance</h3>
          <div className="financial-tabs">
            <button
              onClick={() => setFinancialView('quarterly')}
              className={financialView === 'quarterly' ? 'active' : ''}
            >
              Quarterly
            </button>
            <button
              onClick={() => setFinancialView('annual')}
              className={financialView === 'annual' ? 'active' : ''}
            >
              Annual
            </button>
          </div>
          <div className="table-container">
            {financialView === 'quarterly' ? (
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
                  {financialData.quarterly.map((report, index) => (
                    <tr key={index}>
                      <td>{report.fiscalDateEnding}</td>
                      <td>
                        ${Number(report.totalRevenue).toLocaleString()}
                      </td>
                      <td>
                        ${Number(report.grossProfit).toLocaleString()}
                      </td>
                      <td>
                        ${Number(report.netIncome).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
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
                  {financialData.annual.map((report, index) => (
                    <tr key={index}>
                      <td>{report.fiscalDateEnding}</td>
                      <td>
                        ${Number(report.totalRevenue).toLocaleString()}
                      </td>
                      <td>
                        ${Number(report.grossProfit).toLocaleString()}
                      </td>
                      <td>
                        ${Number(report.netIncome).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <p>Financial data is not available.</p>
      )}

      {/* News Information Section */}
      {newsData.length > 0 ? (
        <div className="news-section">
          <h3>Latest News</h3>
          <div className="news-cards">
            {newsData.map((newsItem, index) => (
              <div key={index} className="news-card">
                {newsItem.banner_image && (
                  <img src={newsItem.banner_image} alt="News" />
                )}
                <div className="news-content">
                  <a
                    href={newsItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h4>{newsItem.title}</h4>
                  </a>
                  <p>{newsItem.summary}</p>
                  <p>
                    <small>
                      {new Date(
                        newsItem.publishedDate
                      ).toLocaleString()}
                    </small>
                  </p>
                  {newsItem.sentiment && (
                    <span
                      className={`sentiment-tag ${newsItem.sentiment}`}
                    >
                      {newsItem.sentiment}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
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
                  <th></th>
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
                    <td>
                      {transaction.Shares > 10000 && (
                        <span className="major-transaction-badge">
                          Major {transaction.TransactionType}
                        </span>
                      )}
                    </td>
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
