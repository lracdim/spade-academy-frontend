import React, { useState } from 'react';
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
import { UserPlus } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { createUser } from '../../api/user';
import { toast } from 'sonner';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultRole: 'ADMIN' | 'GUARD';
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess, defaultRole }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        employeeId: '',
        password: '',
        role: defaultRole,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.employeeId || !formData.password) {
            toast.error('Name, Employee ID, and Password are required');
            return;
        }

        setLoading(true);
        try {
            await createUser(formData);
            toast.success(`${formData.role === 'ADMIN' ? 'Admin' : 'Guard'} created successfully`);
            setFormData({
                fullName: '',
                email: '',
                employeeId: '',
                password: '',
                role: defaultRole,
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            const errMessage = error.response?.data?.message || 'Failed to create user';
            toast.error(errMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <DialogHeader className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                                Add New {defaultRole === 'ADMIN' ? 'Administrator' : 'Security Guard'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 text-xs font-medium mt-1">
                                Create a new account and grant access to the platform.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="Enter full name"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="h-11 border-gray-100 focus:ring-black focus:border-black rounded-xl bg-gray-50/50 border-2"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="employeeId" className="text-xs font-black uppercase tracking-widest text-gray-400">Employee ID / Badge No.</Label>
                            <Input
                                id="employeeId"
                                placeholder="e.g. EMP123"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                className="h-11 border-gray-100 focus:ring-black focus:border-black rounded-xl bg-gray-50/50 border-2"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address (Optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-11 border-gray-100 focus:ring-black focus:border-black rounded-xl bg-gray-50/50 border-2"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-gray-400">Initial Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
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
                            className="bg-black text-white hover:bg-gray-800 font-bold px-8 rounded-xl h-11 shadow-lg shadow-black/10 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" showLogo={false} />
                            ) : (
                                <UserPlus className="w-4 h-4" />
                            )}
                            Create Account
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateUserModal;
