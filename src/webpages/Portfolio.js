import React from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Portfolio = () => {
  // This would typically come from your API
  const stocks = [
    { name: 'AAPL', value: 30000, shares: 200 },
    { name: 'GOOGL', value: 25000, shares: 15 },
    { name: 'MSFT', value: 20000, shares: 80 },
    { name: 'AMZN', value: 15000, shares: 10 },
    { name: 'FB', value: 10000, shares: 40 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const totalValue = stocks.reduce((sum, stock) => sum + stock.value, 0);

  return (
    <div className="portfolio">
      <h1 className="text-2xl font-bold mb-4">Your Portfolio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Portfolio Composition</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stocks}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stocks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Holdings</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stocks.map((stock, index) => (
                <div key={stock.name} className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{stock.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({stock.shares} shares)</span>
                  </div>
                  <div>
                    <span className="font-semibold">${stock.value.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({((stock.value / totalValue) * 100).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;