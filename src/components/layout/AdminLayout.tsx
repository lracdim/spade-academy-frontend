import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { getNotifications, markNotificationsAsRead } from '../../api/notification';
import type { Notification } from '../../api/notification';

const AdminLayout: React.FC = () => {
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
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center flex-1 max-w-md">
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gray-200 focus:bg-white transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={() => handleMarkAsRead()}
                                                className="text-xs font-semibold text-amber-500 hover:text-amber-600"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                No notifications
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-amber-50/30' : ''}`}
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
                                                            <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-1.5" />
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

                        <div className="w-px h-6 bg-gray-200" />

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
