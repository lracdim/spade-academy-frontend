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
    { icon: LayoutDashboard, label: 'Home', path: '/guard' },
    { icon: BookOpen, label: 'Learn', path: '/guard/learning-hub' },
    { icon: Award, label: 'Certificates', path: '/guard/certificates' },
    { icon: BookText, label: 'Records', path: '/guard/knowledge-record' },
    { icon: Settings, label: 'Settings', path: '/guard/settings' },
];

const GuardMobileNav: React.FC = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1 z-50 lg:hidden safe-area-bottom">
            <div className="flex items-center justify-around">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/guard'}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[64px]",
                                isActive
                                    ? "text-[#d0a868]"
                                    : "text-gray-400 active:text-gray-600"
                            )
                        }
                    >
                        <item.icon className={cn("w-5 h-5 mb-1")} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default GuardMobileNav;
