import React from 'react';
import { Outlet } from 'react-router-dom';
import GuardSidebar from './GuardSidebar';
import GuardMobileNav from './GuardMobileNav';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { getNotifications, markNotificationsAsRead } from '../../api/notification';
import type { Notification } from '../../api/notification';

const GuardLayout: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = React.useState(false);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    React.useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id?: string) => {
        try {
            await markNotificationsAsRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    const handleLogout = () => {
        authApi.logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-body text-gray-900">
            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block h-full">
                <GuardSidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-20 w-full shrink-0">
                    {/* Mobile Logo Section */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg" />
                        <span className="font-display text-gray-900 font-black text-sm uppercase leading-tight">
                            Spade<br />Academy
                        </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={() => handleMarkAsRead()}
                                                className="text-xs font-semibold text-[#d0a868] hover:text-[#b08d50]"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[60vh] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                No notifications
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-[#d0a868]/5' : ''}`}
                                                    onClick={() => {
                                                        if (!notif.isRead) handleMarkAsRead(notif.id);
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                                {notif.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                                {notif.message}
                                                            </p>
                                                        </div>
                                                        {!notif.isRead && (
                                                            <div className="w-2 h-2 bg-[#d0a868] rounded-full flex-shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-gray-200 hidden sm:block" />

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 pt-6 px-5">
                    <Outlet />
                </main>

                {/* Mobile Bottom Nav */}
                <GuardMobileNav />
            </div>
        </div>
    );
};

export default GuardLayout;
