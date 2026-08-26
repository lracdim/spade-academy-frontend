import React from 'react';
import { Settings } from 'lucide-react';

const GuardSettings: React.FC = () => {
    return (
        <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with brand feel */}
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
                <div className="w-16 h-16 bg-white rounded-3xl border border-gray-50 shadow-sm flex items-center justify-center mb-2">
                    <Settings className="w-8 h-8 text-[#d0a868]" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">PREFERENCES</h1>
                <p className="text-[10px] font-bold text-[#d0a868] uppercase tracking-[0.2em]">Manage Your Guard Identity</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden divide-y divide-gray-50">
                {/* Profile Section */}
                <div className="p-8 sm:p-10 space-y-8">
                    <div className="space-y-1">
                        <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Profile Information</h2>
                        <p className="text-xs text-gray-400 font-medium">Your account details as registered in the system.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="w-full bg-gray-50/50 border border-transparent rounded-2xl p-4 text-sm font-bold text-gray-900 select-none">
                                Guard User
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="w-full bg-gray-50/50 border border-transparent rounded-2xl p-4 text-sm font-bold text-gray-900 select-none">
                                guard@example.com
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="p-8 sm:p-10 space-y-8">
                    <div className="space-y-1">
                        <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Digital Experience</h2>
                        <p className="text-xs text-gray-400 font-medium">Customize how you receive alerts and updates.</p>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-transparent group hover:bg-white hover:border-gray-50 transition-all">
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-900">Push Notifications</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">New Course assignments & reminders</p>
                        </div>
                        <div className="w-12 h-6 bg-[#d0a868] rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(208,168,104,0.3)]">
                            <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="p-8 sm:p-10 bg-gray-50/30">
                    <button className="w-full py-5 bg-white border border-gray-100 text-[10px] font-black text-red-500 uppercase tracking-[0.25em] rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-[0.98]">
                        Sign Out of Session
                    </button>
                    <p className="text-center text-[9px] font-bold text-gray-300 uppercase tracking-[0.1em] mt-6">
                        ACED ACADEMY v1.0.4
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GuardSettings;
