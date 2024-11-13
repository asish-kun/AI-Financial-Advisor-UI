// src/components/SignupPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpPage.css';

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [investmentGoal, setInvestmentGoal] = useState('');
    const [riskAppetite, setRiskAppetite] = useState('');
    const [timeHorizon, setTimeHorizon] = useState('');

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            // Update to point to the correct backend port, e.g., 5000
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    gender,
                    age,
                    investmentGoal,
                    riskAppetite,
                    timeHorizon,
                }),
            });

            if (!response.ok) {
                throw new Error('Signup failed. Please try again.');
            }

            const data = await response.json();
            alert(data.message || 'Signup successful');

            // Redirect to login page upon successful signup
            navigate('/login');
        } catch (error) {
            console.error('Error during signup:', error);
            alert('There was a problem with the signup process. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSignup}>
            <h1>Sign Up</h1>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <input type="text" placeholder="Gender" value={gender} onChange={(e) => setGender(e.target.value)} required />
            <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required />

            <select value={investmentGoal} onChange={(e) => setInvestmentGoal(e.target.value)} required>
                <option value="">Primary Investment Goal</option>
                <option value="capital_growth">Capital Growth</option>
                <option value="income_generation">Income Generation</option>
                <option value="capital_preservation">Capital Preservation</option>
            </select>

            <select value={riskAppetite} onChange={(e) => setRiskAppetite(e.target.value)} required>
                <option value="">Risk Appetite</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>

            <select value={timeHorizon} onChange={(e) => setTimeHorizon(e.target.value)} required>
                <option value="">Time Horizon</option>
                <option value="short_term">Short-term (1-3 years)</option>
                <option value="medium_term">Medium-term (3-7 years)</option>
                <option value="long_term">Long-term (7+ years)</option>
            </select>

            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignupPage;
