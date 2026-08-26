import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteCourse } from '../../api/course';
import { useToast } from '@/hooks/use-toast';

interface DeleteCourseModalProps {
    courseId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (deletedCourseId: string) => void;
}

const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({ courseId, isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!courseId) return;
        setLoading(true);
        try {
            await deleteCourse(courseId);
            toast({ title: 'Success', description: 'Course deleted successfully' });
            onSuccess(courseId);
            onClose();
        } catch (error) {
            console.error('Failed to delete course:', error);
            toast({ title: 'Error', description: 'Failed to delete course', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-red-600 text-xl font-bold">Delete Course</DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2">
                        Are you sure you want to delete this course? This action cannot be undone and will delete all associated modules and lessons.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl border-gray-200">
                        Cancel
                    </Button>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={handleDelete} disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete Course'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteCourseModal;
