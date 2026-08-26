import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Users
} from 'lucide-react';
import { getUsers, deleteUser } from '../../api/user';
import type { User } from '../../api/user';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreateUserModal from '../../components/user/CreateUserModal';
import EditUserModal from '../../components/user/EditUserModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { toast } from 'sonner';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers('ADMIN');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            await deleteUser(selectedUser.id);
            toast.success('Admin deleted successfully');
            fetchUsers();
            setSelectedUser(null);
        } catch (error) {
            console.error('Failed to delete admin:', error);
            toast.error('Failed to delete admin');
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Management</h1>
                    <p className="text-gray-500 font-medium font-body text-sm">Add and manage administrators for the platform</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                >
                    <Plus className="w-4 h-4 text-white" />
                    Add Admin
                </button>
            </div>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
                defaultRole="ADMIN"
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchUsers}
                user={selectedUser}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setSelectedUser(null); }}
                onConfirm={handleDelete}
                title="Delete Administrator"
                message={`Are you sure you want to delete ${selectedUser?.fullName}? They will lose all access to the admin panel.`}
                confirmText="Delete Admin"
                type="danger"
            />

            <div className="flex items-center justify-between gap-4 mt-8">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search admins..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#3d3d3d] border-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-700 shadow-sm transition-all"
                    />
                </div>
                <div className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">{filteredUsers.length} admins</span>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Created</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-6 text-xs text-gray-400 font-bold">{user.employeeId}</td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                                {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 1)}
                                            </div>
                                            <div className="font-bold text-gray-900 text-sm">{user.fullName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center text-sm text-gray-500 font-medium lowercase">
                                        {user.email || '-'}
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 shadow-sm mx-auto w-fit">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className="text-xs font-bold text-gray-400">-</span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }}
                                                className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all active:scale-90 border border-transparent hover:border-amber-100"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                             <button
                                                onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}
                                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90 border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                                <Users className="w-8 h-8 text-gray-200" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-900 font-bold">No admins found</p>
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

export default AdminUsersPage;
