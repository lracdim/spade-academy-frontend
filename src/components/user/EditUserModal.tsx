import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { updateUser } from '../../api/user';
import type { User } from '../../api/user';
import { toast } from 'sonner';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        employeeId: '',
        password: '',
        role: 'GUARD' as 'ADMIN' | 'GUARD',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                employeeId: user.employeeId || '',
                password: '', // Don't populate the password field for editing
                role: user.role,
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!formData.fullName || !formData.employeeId) {
            toast.error('Name and Employee ID are required');
            return;
        }

        setLoading(true);
        try {
            await updateUser(user.id, formData);
            toast.success(`${formData.role === 'ADMIN' ? 'Admin' : 'Guard'} updated successfully`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <DialogHeader className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <Pencil className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                                Edit {user.role === 'ADMIN' ? 'Administrator' : 'Security Guard'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 text-xs font-medium mt-1">
                                Update the details for this account.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-fullName" className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</Label>
                            <Input
                                id="edit-fullName"
                                placeholder="Enter full name"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="h-11 border-gray-100 focus:ring-black focus:border-black rounded-xl bg-gray-50/50 border-2"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-employeeId" className="text-xs font-black uppercase tracking-widest text-gray-400">Employee ID / Badge No.</Label>
                            <Input
                                id="edit-employeeId"
                                placeholder="e.g. EMP123"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                className="h-11 border-gray-100 focus:ring-black focus:border-black rounded-xl bg-gray-50/50 border-2"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-email" className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address (Optional)</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-11 border-gray-100 focus:ring-black focus:border-black rounded-xl bg-gray-50/50 border-2"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-password" className="text-xs font-black uppercase tracking-widest text-gray-400">Reset Password (Optional)</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                placeholder="Leave blank to keep current password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="h-11 border-gray-100 focus:ring-black focus:border-black rounded-xl bg-gray-50/50 border-2"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-amber-500 text-white hover:bg-amber-600 font-bold px-8 rounded-xl h-11 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" showLogo={false} />
                            ) : (
                                <Pencil className="w-4 h-4" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditUserModal;
