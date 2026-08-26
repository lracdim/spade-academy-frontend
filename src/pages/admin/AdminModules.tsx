import React from 'react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-in fade-in zoom-in duration-500 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse"></div>
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight lowercase first-letter:uppercase">{title}</h2>
            <p className="text-gray-400 font-medium text-sm max-w-xs">This module is currently being calibrated for the next structural deployment phase.</p>
        </div>
    </div>
);

export const AdminSettings = () => <PlaceholderPage title="System Settings" />;
