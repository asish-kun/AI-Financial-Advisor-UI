import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContainer from './webpages/MainContainer';
import StockDetails from './webpages/StockDetails';
import Portfolio from './webpages/Portfolio';
import Dashboard from './webpages/Dashboard';
import Account from './webpages/Account';

function App() {
  return (
    <Router>
      <div className="App flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-6"> {/* Adjust margin to account for sidebar width */}
          <Routes>
            <Route path="/advisor" element={<MainContainer />} />
            <Route path="/stocks/:symbol" element={<StockDetails />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;