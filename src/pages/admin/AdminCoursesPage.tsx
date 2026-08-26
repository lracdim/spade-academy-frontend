import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    BookOpen,
    Clock,
    LayoutGrid
} from 'lucide-react';
import { getCourses } from '../../api/course';
import type { Course } from '../../api/course';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import CreateCourseModal from '../../components/course/CreateCourseModal';
import EditCourseModal from '../../components/course/EditCourseModal';
import DeleteCourseModal from '../../components/course/DeleteCourseModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { updateCourse } from '../../api/course';
import { useToast } from '@/hooks/use-toast';

const resolveUrl = (url: string | null | undefined): string => {
    if (!url) return '/logo.jpg';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${url}`;
};

const AdminCourses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await getCourses();
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleTogglePublish = async (e: React.MouseEvent, course: Course) => {
        e.stopPropagation();
        try {
            await updateCourse(course.id, { isPublished: !course.isPublished });
            setCourses(courses.map(c => c.id === course.id ? { ...c, isPublished: !course.isPublished } : c));
            toast({
                title: "Success",
                description: `Course ${!course.isPublished ? 'published' : 'moved to draft'} successfully`,
            });
        } catch (error) {
            console.error('Failed to update status:', error);
            toast({
                title: "Error",
                description: "Failed to update course status",
                variant: 'destructive',
            });
        }
    };

    const handleDeleteCourse = (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation();
        setCourseToDelete(courseId);
        setIsDeleteModalOpen(true);
    };

    const handleEditCourse = (e: React.MouseEvent, course: Course) => {
        e.stopPropagation();
        setCourseToEdit(course);
        setIsEditModalOpen(true);
    };

    const filteredCourses = courses.filter(course => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'published' && course.isPublished) ||
            (filter === 'draft' && !course.isPublished);

        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Training Courses</h1>
                    <p className="text-gray-500 font-medium">Manage your training modules and lessons.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Course
                </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gray-200 transition-all placeholder:text-gray-400 shadow-sm"
                    />
                </div>

                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 shadow-sm self-start sm:self-auto">
                    {(['all', 'published', 'draft'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                                filter === f
                                    ? "bg-white text-black shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {f === 'all' ? 'All Courses' : f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                    <div
                        key={course.id}
                        onClick={() => window.location.href = `/admin/courses/${course.id}/modules`}
                        className="cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col hover:border-black/10"
                    >
                        <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            <img 
                                src={resolveUrl(course.thumbnail)} 
                                alt={course.title} 
                                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />

                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20",
                                    course.isPublished ? "bg-[#d0a868] text-white" : "bg-gray-500 text-white"
                                )}>
                                    {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                                </span>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button onClick={(e) => e.stopPropagation()} className="bg-black/40 hover:bg-black/60 text-white p-1 rounded-full backdrop-blur-md transition-colors relative z-10">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 z-50" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                handleEditCourse(e as unknown as React.MouseEvent, course);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                handleTogglePublish(e as unknown as React.MouseEvent, course);
                                            }}
                                        >
                                            {course.isPublished ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                            {course.isPublished ? 'Move to Draft' : 'Publish Course'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                handleDeleteCourse(e as unknown as React.MouseEvent, course.id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Course
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-black transition-colors">{course.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{course.description}</p>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold">{course.moduleCount} modules</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold">{course.lessonCount} lessons</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCourses.length === 0 && !loading && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                            <BookOpen className="w-10 h-10 text-gray-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-900 font-bold">No courses found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your filters or search query.</p>
                        </div>
                    </div>
                )}
            </div>

            <CreateCourseModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchCourses}
            />

            <EditCourseModal
                course={courseToEdit}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setTimeout(() => setCourseToEdit(null), 300); // clear after animation
                }}
                onSuccess={fetchCourses}
            />

            <DeleteCourseModal
                courseId={courseToDelete}
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTimeout(() => setCourseToDelete(null), 300); // clear after animation
                }}
                onSuccess={(deletedId) => {
                    setCourses(courses.filter(c => c.id !== deletedId));
                    fetchCourses();
                }}
            />
        </div>
    );
};

export default AdminCourses;
