import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authApi } from '@/api/auth';

const LoginPage: React.FC = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await authApi.login({ employeeId, password });

            // Store tokens and user info
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            toast.success(`Welcome back, ${data.user.fullName}!`);

            // Redirect based on role
            if (data.user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/guard');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-[#f4f4f4] border-[#091018]/10 text-[#091018] shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-display text-center uppercase tracking-tight font-bold">
                    Login Form
                </CardTitle>
                <CardDescription className="text-center text-[#091018]/70">
                    Enter your employee ID and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="employeeId" className="text-sm font-medium text-[#091018]">
                            Employee ID
                        </Label>
                        <Input
                            id="employeeId"
                            placeholder="e.g. GRD001"
                            value={employeeId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployeeId(e.target.value)}
                            required
                            className="bg-white border-[#091018]/20 text-[#091018] focus:ring-[#091018]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-[#091018]">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                            className="bg-white border-[#091018]/20 text-[#091018] focus:ring-[#091018]"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-[#091018] hover:bg-[#091018]/90 text-[#d0a868] font-bold uppercase transition-all"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default LoginPage;
