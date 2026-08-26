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
import { updateCourse } from '../../api/course';
import type { Course } from '../../api/course';
import { uploadFile } from '../../api/upload';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EditCourseModalProps {
    course: Course | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, isOpen, onClose, onSuccess }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'draft' as 'draft' | 'published',
        thumbnail: '',
        certificateTemplate: '',
    });
    const [loading, setLoading] = useState(false);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [uploadingCertificateTemplate, setUploadingCertificateTemplate] = useState(false);

    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const certificateTemplateInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title,
                description: course.description || '',
                status: course.isPublished ? 'published' : 'draft',
                thumbnail: course.thumbnail || '',
                certificateTemplate: course.certificateTemplate || '',
            });
        }
    }, [course]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingThumbnail(true);

        try {
            const { url } = await uploadFile(file);
            setFormData(prev => ({ ...prev, thumbnail: url }));
            toast({ title: "Success", description: "Thumbnail uploaded successfully" });
        } catch (error) {
            console.error('Failed to upload thumbnail:', error);
            toast({ title: "Error", description: "Failed to upload thumbnail", variant: "destructive" });
        } finally {
            setUploadingThumbnail(false);
        }
    };

    const handleCertificateTemplateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingCertificateTemplate(true);
        try {
            const { url } = await uploadFile(file);
            setFormData(prev => ({ ...prev, certificateTemplate: url }));
            toast({ title: 'Success', description: 'Certificate template uploaded successfully' });
        } catch (error) {
            console.error('Failed to upload certificate template:', error);
            toast({ title: 'Error', description: 'Failed to upload certificate template', variant: 'destructive' });
        } finally {
            setUploadingCertificateTemplate(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;

        if (!formData.title || !formData.description) {
            toast({ title: "Error", description: "Title and description are required", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await updateCourse(course.id, {
                title: formData.title,
                description: formData.description,
                isPublished: formData.status === 'published',
                thumbnail: formData.thumbnail || undefined,
                certificateTemplate: formData.certificateTemplate || null,
            });
            toast({ title: "Success", description: "Course updated successfully" });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update course:', error);
            toast({ title: "Error", description: "Failed to update course", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-[90vh] border-none shadow-2xl scrollbar-hide">
                <DialogHeader className="p-6 border-b border-gray-100 flex-row justify-between items-center bg-white sticky top-0 z-10">
                    <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Edit Course</DialogTitle>
                    <DialogDescription className="sr-only">
                        Modifying details for the training course.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Course Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Security Guard Training"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="h-12 border-gray-200 focus:ring-black focus:border-black rounded-xl p-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                            <textarea
                                id="description"
                                placeholder="What will guards learn?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full min-h-[120px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 transition-all font-body resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Status</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                                    className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22gray%22%20d%3D%22M7.247%2011.14L2.451%205.658C1.885%205.013%202.345%204%203.204%204H12.796C13.655%204%2014.115%205.013%2013.549%205.658L8.753%2011.14C8.358%2011.601%207.642%2011.601%207.247%2011.14Z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Thumbnail</Label>
                                <input
                                    type="file"
                                    ref={thumbnailInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div
                                    onClick={() => thumbnailInputRef.current?.click()}
                                    className={cn(
                                        "border-2 border-dashed rounded-2xl p-1 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative min-h-[140px]",
                                        formData.thumbnail ? "border-green-100 bg-green-50/10" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200"
                                    )}
                                >
                                    {formData.thumbnail ? (
                                        <div className="w-full h-full absolute inset-0">
                                            <img src={formData.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6 space-y-2">
                                            <div className="p-2 rounded-lg shadow-sm border bg-white border-gray-100 transition-transform group-hover:scale-110">
                                                {uploadingThumbnail ? (
                                                    <LoadingSpinner size="sm" showLogo={false} />
                                                ) : (
                                                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-bold text-gray-500 group-hover:text-black transition-colors leading-tight">
                                                    {uploadingThumbnail ? 'Uploading...' : 'Click to upload thumbnail'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Certificate template <span className="text-gray-400 font-normal">(optional)</span></Label>
                            <input type="file" ref={certificateTemplateInputRef} className="hidden" accept="image/png,image/jpeg" onChange={handleCertificateTemplateChange} />
                            <button type="button" onClick={() => certificateTemplateInputRef.current?.click()} className="w-full min-h-[88px] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 px-4 flex items-center justify-center gap-3 text-sm font-bold text-gray-600">
                                {uploadingCertificateTemplate ? <LoadingSpinner size="sm" showLogo={false} /> : <Upload className="w-5 h-5" />}
                                {formData.certificateTemplate ? 'Certificate template uploaded — choose another' : 'Upload this course’s blank certificate'}
                            </button>
                            <p className="text-xs text-gray-400">The current shared certificate stays the fallback until a template is uploaded here.</p>
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

export default EditCourseModal;
