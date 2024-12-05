import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { User, Mail, Phone, Shield, Trash2 } from 'lucide-react';
import axios from 'axios';

const Account = () => {

    const BASE_URL = 'http://127.0.0.1:5000';

    // This would typically come from your authentication system or API
    const user = {
        name: "John Doe",
        email: "test@123.com",
        phone: "+1 (555) 123-4567",
        lastLogin: "2024-10-08 14:30:00"
    };

    const [message, setMessage] = useState('');

    const handleDeletePortfolio = async () => {
        try {
            // Make API call to delete the user's portfolio
            const response = await axios.delete(`${BASE_URL}/delete-portfolio/${user.email}`);
            setMessage(response.data.message);
            // Optionally, refresh the user data or redirect the user
        } catch (error) {
            setMessage('An error occurred while deleting the portfolio.');
            console.error(error);
        }
    };

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
                            <span>{user.name}</span>
                        </div>
                        <div className="flex items-center">
                            <Mail className="mr-2" />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="mr-2" />
                            <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center">
                            <Shield className="mr-2" />
                            <span>Last login: {user.lastLogin}</span>
                        </div>
                        {/* Add the delete portfolio button */}
                        <button
                            onClick={handleDeletePortfolio}
                            className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
                        >
                            Delete Portfolio
                        </button>
                        {message && <p className="mt-2">{message}</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Account;