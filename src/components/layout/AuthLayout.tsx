import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#f4f4f4] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <img 
                        src="/logo.jpg" 
                        alt="Spade Academy Logo" 
                        className="w-24 h-24 object-contain mb-4 rounded-full shadow-sm"
                    />
                    <h1 className="text-3xl font-display text-[#091018] font-black uppercase tracking-[0.2em]">
                        SPADE ACADEMY
                    </h1>
                </div>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
