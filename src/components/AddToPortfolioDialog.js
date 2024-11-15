// AddToPortfolioDialog.js
import React, { useState, useRef, useEffect } from 'react';
import './AddToPortfolioDialog.css';
import { useNavigate } from 'react-router-dom';

function AddToPortfolioDialog({ symbol, currentPrice, companyOverview, financialData, newsData, lastWeekData, onClose }) {
    const [amount, setAmount] = useState('');
    const [shares, setShares] = useState('');
    const [investmentType, setInvestmentType] = useState('Lifetime');
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    const dialogRef = useRef(null);
    const isFormValid = amount > 0 && shares > 0;

    useEffect(() => {
        // Handler for clicking outside
        const handleClickOutside = (event) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target)) {
                closeDialog();
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const closeDialog = () => {
        setAmount('');
        setShares('');
        setInvestmentType('Lifetime');
        setShowSuccess(false);
        onClose();
    };

    const handleAmountChange = (e) => {
        const newAmount = e.target.value;
        setAmount(newAmount);

        if (currentPrice > 0 && newAmount) {
            setShares((newAmount / currentPrice).toFixed(4));
        } else {
            setShares('');
        }
    };

    const handleSharesChange = (e) => {
        const newShares = e.target.value;
        setShares(newShares);

        if (currentPrice > 0 && newShares) {
            setAmount((newShares * currentPrice).toFixed(2));
        } else {
            setAmount('');
        }
    };

    const handleViewPortfolio = () => {
        onClose();
        navigate('/portfolio');
    };

    const handleConfirm = () => {
        if (amount > 0 && shares > 0) {
            const existingPortfolio = JSON.parse(localStorage.getItem('portfolio')) || [];

            const newStock = {
                symbol,
                amount: parseFloat(amount),
                shares: parseFloat(shares),
                investmentType,
                purchasePrice: currentPrice,
                dateOfPurchase: new Date(),
                predictedPrice: null, // Placeholder for predicted price
                riskAssessment: null, // Placeholder for risk assessment
                currentPrice,
                lastWeekData,
                companyOverview,
                financialData,
                newsData,
            };

            const updatedPortfolio = [...existingPortfolio, newStock];
            localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));

            setShowSuccess(true);
        }
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog-content" ref={dialogRef}>
                {!showSuccess ? (
                    <>
                        <h2>Add {symbol} to Your Portfolio</h2>
                        <div className="input-group">
                            <label>Amount you want to invest:</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="input-group">
                            <label>Number of Stocks:</label>
                            <input
                                type="number"
                                value={shares}
                                onChange={handleSharesChange}
                                min="0"
                                step="0.0001"
                            />
                        </div>
                        <div className="input-group">
                            <label>Type of Investment:</label>
                            <select value={investmentType} onChange={(e) => setInvestmentType(e.target.value)}>
                                <option value="Lifetime">Lifetime</option>
                                <option value="Short Term">Short Term</option>
                            </select>
                        </div>

                        <button onClick={handleConfirm} className="confirm-button" disabled={!isFormValid}>
                            Confirm
                        </button>
                    </>
                ) : (
                    <div className="success-message">
                        <div className="tick-mark">✓</div>
                        <h2>Stock Successfully Added to Your Portfolio!</h2>
                        <button onClick={handleViewPortfolio} className="view-portfolio-button">
                            View Your Portfolio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddToPortfolioDialog;