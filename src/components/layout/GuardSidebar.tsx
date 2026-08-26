import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Award,
    BookText,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/guard' },
    { icon: BookOpen, label: 'My Learning Hub', path: '/guard/learning-hub' },
    { icon: Award, label: 'Certificates', path: '/guard/certificates' },
    { icon: BookText, label: 'Knowledge Record', path: '/guard/knowledge-record' },
    { icon: Settings, label: 'Settings', path: '/guard/settings' },
];

const GuardSidebar: React.FC = () => {
    const [user, setUser] = React.useState<{ fullName: string; role: string } | null>(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
    }, []);

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="w-64 h-full bg-[#111827] flex flex-col">
            <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm" />
                <span className="font-display text-white font-bold tracking-tight text-lg uppercase leading-tight">
                    Spade<br />Academy
                </span>
            </div>

            <div className="px-6 py-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Learner Menu</p>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/guard'}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )
                        }
                    >
                        <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
                        <span className="font-body font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800 mt-auto">
                <div className="flex items-center gap-3 px-2 py-3 bg-white/5 rounded-lg mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-white font-bold">
                        {user?.fullName ? getInitials(user.fullName) : 'G'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'Guard'}</p>
                        <p className="text-xs text-gray-400 truncate">Security Guard</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuardSidebar;
