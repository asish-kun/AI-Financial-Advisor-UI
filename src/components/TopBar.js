import React, { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const API_KEY = '9ZQUXAH9JOQRSQDV';

    const fetchUserDetails = async () => {
        const email = localStorage.getItem('email');
        if (!email) {
            alert('No user email found. Redirecting to login.');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/user-details/${encodeURIComponent(email)}`, {
                method: 'GET',
            });

            if (response.ok) {
                const data = await response.json();
                const cachedUserDetails = localStorage.getItem('userDetails');
                // Compare the new data with the cached data
                if (!cachedUserDetails || JSON.stringify(data) !== cachedUserDetails) {
                    localStorage.setItem('userDetails', JSON.stringify(data)); // Update local storage
                }
                setUserDetails(data); // Update state with fetched data
            } else {
                alert('Failed to fetch user details. Redirecting to login.');
                navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false); // Stop loading once the API call completes
        }
    };

    useEffect(() => {
        // Check if cached user details are available
        const cachedUserDetails = localStorage.getItem('userDetails');
        if (cachedUserDetails) {
            setUserDetails(JSON.parse(cachedUserDetails));
            setLoading(false); // Display cached data immediately
        }

        // Fetch updated user details from the API
        fetchUserDetails();
    }, []);

    // Function to handle the API call for stock search
    const handleSearch = async (query) => {
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
            );
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
                    {loading ? (
                        <div>Loading...</div>
                    ) : userDetails ? (
                        <>
                            <div className="user-name">{userDetails.username}</div>
                            <div className="user-email">{userDetails.email}</div>
                        </>
                    ) : (
                        <div>Error fetching user details</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
