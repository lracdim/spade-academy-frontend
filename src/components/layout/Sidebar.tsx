import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    UserPlus,
    Award,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
    { icon: Users, label: 'Guards', path: '/admin/guards' },
    { icon: UserPlus, label: 'Users', path: '/admin/users' },
    { icon: Award, label: 'Certificates', path: '/admin/certificates' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const Sidebar: React.FC = () => {
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="w-64 h-full bg-white border-r border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm" />
                <span className="font-display text-gray-900 font-bold tracking-tight text-lg uppercase leading-tight">
                    Spade<br />Academy
                </span>
            </div>

            <nav className="flex-1 px-0 py-4 space-y-0">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-6 py-3.5 transition-all duration-200 group border-l-4",
                                isActive
                                    ? "bg-[#111827] text-white border-[#111827]"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-transparent"
                            )
                        }
                    >
                        <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
                        <span className="font-body font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-3 px-2 py-3">
                    <div className="w-10 h-10 rounded-lg bg-[#D4AF37] flex items-center justify-center text-white font-bold">
                        {user?.fullName ? getInitials(user.fullName) : 'AD'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || 'Administrator'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.role === 'ADMIN' ? 'Administrator' : 'User'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
