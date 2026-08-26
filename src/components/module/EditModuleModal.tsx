import React, { useState, useRef, useEffect } from 'react';
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
import { Upload } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { updateModule } from '../../api/module';
import type { Module } from '../../api/module';
import { uploadFile } from '../../api/upload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditModuleModalProps {
    moduleItem: Module | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const EditModuleModal: React.FC<EditModuleModalProps> = ({ moduleItem, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        video: '',
    });
    const [loading, setLoading] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);

    const videoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (moduleItem) {
            setFormData({
                title: moduleItem.title,
                description: moduleItem.description || '',
                video: moduleItem.video || '',
            });
        }
    }, [moduleItem]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (1GB = 1024 * 1024 * 1024 bytes)
        const ONE_GB = 1024 * 1024 * 1024;
        if (file.size > ONE_GB) {
            toast.error('Video file size exceeds the 1GB limit');
            if (videoInputRef.current) videoInputRef.current.value = '';
            return;
        }

        setUploadingVideo(true);

        try {
            const { url } = await uploadFile(file);
            setFormData(prev => ({ ...prev, video: url }));
            toast.success('Video uploaded successfully');
        } catch (error) {
            console.error('Failed to upload video:', error);
            toast.error('Failed to upload video');
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleItem) return;

        if (!formData.title) {
            toast.error('Title is required');
            return;
        }

        setLoading(true);
        try {
            await updateModule(moduleItem.id, {
                title: formData.title,
                description: formData.description || undefined,
                video: formData.video || undefined,
            });
            toast.success('Module updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update module:', error);
            toast.error('Failed to update module');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-[90vh] border-none shadow-2xl scrollbar-hide">
                <DialogHeader className="p-6 border-b border-gray-100 flex-row justify-between items-center bg-white sticky top-0 z-10">
                    <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Edit Module</DialogTitle>
                    <DialogDescription className="sr-only">
                        Modifying details for the module.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Module Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Introduction to Patrolling"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="h-12 border-gray-200 focus:ring-black focus:border-black rounded-xl p-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                            <textarea
                                id="description"
                                placeholder="What will guards learn in this module?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full min-h-[120px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 transition-all font-body resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Module Video</Label>
                            <input
                                type="file"
                                ref={videoInputRef}
                                className="hidden"
                                accept="video/*"
                                onChange={handleFileChange}
                            />
                            <div
                                onClick={() => videoInputRef.current?.click()}
                                className={cn(
                                    "border-2 border-dashed rounded-2xl p-1 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative min-h-[140px]",
                                    formData.video ? "border-indigo-100 bg-indigo-50/10" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200"
                                )}
                            >
                                {formData.video ? (
                                    <div className="w-full h-full absolute inset-0">
                                        <video src={formData.video} className="w-full h-full object-cover" muted />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 space-y-2">
                                        <div className="p-2 rounded-lg shadow-sm border bg-white border-gray-100 transition-transform group-hover:scale-110">
                                            {uploadingVideo ? (
                                                <LoadingSpinner size="sm" showLogo={false} />
                                            ) : (
                                                <Upload className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-gray-500 group-hover:text-black transition-colors leading-tight">
                                                {uploadingVideo ? 'Uploading...' : 'Click to upload video'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-11 px-6 rounded-xl border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="h-11 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                            disabled={loading}
                        >
                            {loading && <LoadingSpinner size="sm" showLogo={false} className="mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditModuleModal;
