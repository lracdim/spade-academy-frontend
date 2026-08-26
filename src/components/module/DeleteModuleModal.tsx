import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteModule } from '../../api/module';
import { toast } from 'sonner';

interface DeleteModuleModalProps {
    moduleId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (deletedModuleId: string) => void;
}

const DeleteModuleModal: React.FC<DeleteModuleModalProps> = ({ moduleId, isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!moduleId) return;
        setLoading(true);
        try {
            await deleteModule(moduleId);
            toast.success('Module deleted successfully');
            onSuccess(moduleId);
            onClose();
        } catch (error) {
            console.error('Failed to delete module:', error);
            toast.error('Failed to delete module');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-red-600 text-xl font-bold">Delete Module</DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2">
                        Are you sure you want to delete this module? This action cannot be undone and will delete all associated lessons and quizzes.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl border-gray-200">
                        Cancel
                    </Button>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={handleDelete} disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete Module'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteModuleModal;
