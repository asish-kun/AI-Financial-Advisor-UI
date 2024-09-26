import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createChart } from 'lightweight-charts';

function StockDetails() {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const chartContainerRef = useRef();

  // Fetch global quote for current price and today's stats
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/stocks/quote?symbol=${symbol}`)
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

  // Fetch daily data for the stock
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/stocks/daily?symbol=${symbol}&outputsize=compact`)
      .then((response) => response.json())
      .then((data) => {
        if (data['Time Series (Daily)']) {
          const timeSeries = data['Time Series (Daily)'];
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
  }, [symbol]);

  // Create chart
  useEffect(() => {
    if (stockData && chartContainerRef.current) {
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

      const chartData = stockData.map((dataPoint) => ({
        time: dataPoint.date,
        value: dataPoint.close,
      }));

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
  }, [stockData]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>{symbol}</h2>
      {todayStats ? (
        <div>
          <p>Current Price: ${todayStats.currentPrice.toFixed(2)}</p>
          <p>Open Price: ${todayStats.openPrice.toFixed(2)}</p>
          <p>High Price: ${todayStats.highPrice.toFixed(2)}</p>
          <p>Low Price: ${todayStats.lowPrice.toFixed(2)}</p>
          <p>Previous Close: ${todayStats.previousClose.toFixed(2)}</p>
          <p>
            Change: ${todayStats.change.toFixed(2)} ({todayStats.changePercent})
          </p>
        </div>
      ) : (
        <p>Today's statistics are not available.</p>
      )}
      <div ref={chartContainerRef} style={{ marginTop: '20px' }}></div>
    </div>
  );
}

export default StockDetails;
