import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { User, Mail, Phone, Shield, Calendar } from 'lucide-react';

const Account = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:5000/account', {
                    method: 'GET',
                    credentials: 'include', // Sends session cookie along with request
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUser(data); // Set user data with all details retrieved from Cosmos DB
            } catch (error) {
                setError(error.message || 'An error occurred while fetching user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="account">
            <h1 className="text-2xl font-bold mb-4">Account Information</h1>
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <h2 className="text-xl font-semibold">Personal Details</h2>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <User className="mr-2" />
                            <span>{user.username}</span>
                        </div>
                        <div className="flex items-center">
                            <Mail className="mr-2" />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="mr-2" />
                            <span>Age: {user.age}</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="mr-2" />
                            <span>{user.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <Shield className="mr-2" />
                            <span>Last login: {user.lastLogin || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <User className="mr-2" />
                            <span>Gender: {user.gender}</span>
                        </div>
                        <div className="flex items-center">
                            <Shield className="mr-2" />
                            <span>Investment Goal: {user.investmentGoal}</span>
                        </div>
                        <div className="flex items-center">
                            <Shield className="mr-2" />
                            <span>Risk Appetite: {user.riskAppetite}</span>
                        </div>
                        <div className="flex items-center">
                            <Shield className="mr-2" />
                            <span>Time Horizon: {user.timeHorizon}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Account;
