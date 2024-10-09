import React from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { User, Mail, Phone, Shield } from 'lucide-react';

const Account = () => {
    // This would typically come from your authentication system or API
    const user = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        lastLogin: "2024-10-08 14:30:00"
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Account;