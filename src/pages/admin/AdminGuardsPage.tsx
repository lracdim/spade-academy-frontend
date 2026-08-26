import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    User
} from 'lucide-react';
import { getUsers, deleteUser } from '../../api/user';
import type { User as UserType } from '../../api/user';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreateUserModal from '../../components/user/CreateUserModal';
import EditUserModal from '../../components/user/EditUserModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { toast } from 'sonner';

const AdminGuardsPage: React.FC = () => {
    const [guards, setGuards] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedGuard, setSelectedGuard] = useState<UserType | null>(null);

    const fetchGuards = async () => {
        setLoading(true);
        try {
            const data = await getUsers('GUARD');
            setGuards(data);
        } catch (error) {
            console.error('Failed to fetch guards:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuards();
    }, []);

    const filteredGuards = guards.filter(guard =>
        guard.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guard.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async () => {
        if (!selectedGuard) return;
        try {
            await deleteUser(selectedGuard.id);
            toast.success('Guard deleted successfully');
            fetchGuards();
            setSelectedGuard(null);
        } catch (error) {
            console.error('Failed to delete guard:', error);
            toast.error('Failed to delete guard');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Guards</h1>
                    <p className="text-gray-500 font-medium">Manage your security guard trainees.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Guard
                </button>
            </div>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchGuards}
                defaultRole="GUARD"
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchGuards}
                user={selectedGuard}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setSelectedGuard(null); }}
                onConfirm={handleDelete}
                title="Delete Guard"
                message={`Are you sure you want to delete ${selectedGuard?.fullName}? This action cannot be undone.`}
                confirmText="Delete Guard"
                type="danger"
            />

            <div className="flex items-center gap-2 mt-8">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search guards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gray-200 transition-all placeholder:text-gray-400 shadow-sm"
                    />
                </div>
                <button className="p-2 border border-gray-100 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors">
                    <div className="w-4 h-4" />
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">All Guards</h2>
                        <p className="text-sm text-gray-500 font-medium">A list of all registered security guards in training.</p>
                    </div>
                    <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        <span className="text-xs font-bold text-gray-600">{filteredGuards.length} Guards</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">SG-Number</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Progress</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Score</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Attempts</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Position</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Joined</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredGuards.map((guard) => (
                                <tr key={guard.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-100 group-hover:scale-105 transition-transform">
                                                {guard.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{guard.fullName}</div>
                                                <div className="text-xs text-gray-400 font-medium">{guard.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded shadow-sm border border-gray-200">
                                            {guard.employeeId || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="text-xs font-black text-[#d0a868]">{guard.progress || '0%'}</span>
                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                                                <div 
                                                    className="h-full bg-[#d0a868] transition-all duration-1000" 
                                                    style={{ width: guard.progress || '0%' }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs font-black px-2.5 py-1 rounded-full border shadow-sm ${
                                            (parseInt(guard.score || '0')) >= 80 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : (parseInt(guard.score || '0')) >= 70
                                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                                            : 'bg-gray-50 text-gray-400 border-gray-100'
                                        }`}>
                                            {guard.score || '0/100'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                                (guard.attempts || 0) >= 3 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                                {guard.attempts || 0} ITEMS
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-bold text-gray-600">Guard</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-bold text-gray-400">{guard.createdAt ? new Date(guard.createdAt).toLocaleDateString() : '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => { setSelectedGuard(guard); setIsEditModalOpen(true); }}
                                                className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all active:scale-90 border border-transparent hover:border-amber-100"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                             <button
                                                onClick={() => { setSelectedGuard(guard); setIsDeleteModalOpen(true); }}
                                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90 border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredGuards.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                                <User className="w-8 h-8 text-gray-200" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-900 font-bold">No guards found</p>
                                                <p className="text-gray-400 text-sm">Try adjusting your search query.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminGuardsPage;
