// src/components/TopBar.js
import React, { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const API_KEY = '9ZQUXAH9JOQRSQDV';

    const user = {
        name: "John Doe",
        email: "john.doe@example.com"
    };

    // Function to handle the API call for stock search
    const handleSearch = async (query) => {
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`);
            const data = await response.json();
            if (data.bestMatches) {
                setSearchResults(data.bestMatches);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]);
        }
        setIsSearching(false);
    };

    // Debounced search query update to limit API calls
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300); // 300ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handle input change
    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Navigate to stock details page when a result is selected
    const handleResultClick = (symbol) => {
        navigate(`/stocks/${symbol}`);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="topbar">
            {/* Application Title */}
            <div className="topbar-title">AI Stock Advisor</div>

            {/* Search Bar */}
            <div className="topbar-search">
                <input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    className="topbar-search-input"
                />
                <Search className="search-icon" />

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="search-results-dropdown">
                        {isSearching ? (
                            <div className="loading">Searching...</div>
                        ) : (
                            searchResults.map((result) => (
                                <div
                                    key={result['1. symbol']}
                                    className="search-result-item"
                                    onClick={() => handleResultClick(result['1. symbol'])}
                                >
                                    {result['1. symbol']} - {result['2. name']}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* User Icon and Details */}
            <div className="topbar-user-details">
                <User className="user-icon" />
                <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
