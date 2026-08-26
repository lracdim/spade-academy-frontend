import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, PlayCircle, Clock, BookOpen, ArrowLeft, MoreVertical, Edit, Trash2, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getModulesByCourse } from '../../api/module';
import type { Module } from '../../api/module';
import CreateModuleModal from '../../components/module/CreateModuleModal';
import EditModuleModal from '../../components/module/EditModuleModal';
import DeleteModuleModal from '../../components/module/DeleteModuleModal';
import AdminManageQuizModal from '../../components/module/AdminManageQuizModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const AdminModulesPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [moduleToEdit, setModuleToEdit] = useState<Module | null>(null);
    const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [moduleToManageQuiz, setModuleToManageQuiz] = useState<Module | null>(null);

    const fetchModules = async () => {
        if (!courseId) return;
        setLoading(true);
        try {
            const data = await getModulesByCourse(courseId);
            setModules(data);
        } catch (error) {
            console.error('Failed to fetch modules:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <button
                onClick={() => navigate('/admin/courses')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Course Modules</h1>
                    <p className="text-gray-500 font-medium">Manage modules for this course.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/admin/courses/${courseId}/play`)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                    >
                        <PlayCircle className="w-4 h-4" />
                        Preview Player
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Module
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {modules.map((moduleItem, index) => (
                    <div
                        key={moduleItem.id}
                        onClick={() => moduleItem.lessonCount > 0
                            ? navigate(`/admin/courses/${courseId}/modules/${moduleItem.id}/lessons`)
                            : navigate(`/admin/courses/${courseId}/play`)}
                        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer hover:border-black/20"
                    >
                        <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            {moduleItem.video ? (
                                <div className="w-full h-full relative">
                                    <video src={moduleItem.video} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                                            <PlayCircle className="w-6 h-6 text-white ml-1" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center">
                                    <BookOpen className="w-10 h-10 text-indigo-200 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            )}

                            <div className="absolute top-4 left-4">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 bg-black text-white"
                                )}>
                                    Module {index + 1}
                                </span>
                            </div>

                            <div className="absolute top-4 right-4 z-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button onClick={(e) => e.stopPropagation()} className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/20">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 z-50" onClick={(e) => e.stopPropagation()}>
                                        <div onClick={(e) => {
                                            e.stopPropagation();
                                            setModuleToEdit(moduleItem);
                                            setIsEditModalOpen(true);
                                        }}>
                                            <DropdownMenuItem className="cursor-pointer font-medium outline-none text-gray-700 focus:text-indigo-600 focus:bg-indigo-50 flex items-center gap-2 transition-colors py-2.5">
                                                <Edit className="w-4 h-4" />
                                                Edit Details
                                            </DropdownMenuItem>
                                        </div>
                                        <div onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/admin/courses/${courseId}/modules/${moduleItem.id}/lessons`);
                                        }}>
                                            <DropdownMenuItem className="cursor-pointer font-medium outline-none text-gray-700 focus:text-indigo-600 focus:bg-indigo-50 flex items-center gap-2 transition-colors py-2.5">
                                                <BookOpen className="w-4 h-4" />
                                                Manage Lessons
                                            </DropdownMenuItem>
                                        </div>
                                        <div onClick={(e) => {
                                            e.stopPropagation();
                                            setModuleToManageQuiz(moduleItem);
                                            setIsQuizModalOpen(true);
                                        }}>
                                            <DropdownMenuItem className="cursor-pointer font-bold text-[#d0a868] focus:text-[#b8955c] focus:bg-[#d0a868]/10 flex items-center gap-2 transition-colors py-2.5 outline-none">
                                                <FileText className="w-4 h-4" />
                                                Manage Quiz
                                            </DropdownMenuItem>
                                        </div>
                                        <div onClick={(e) => {
                                            e.stopPropagation();
                                            setModuleToDelete(moduleItem.id);
                                            setIsDeleteModalOpen(true);
                                        }}>
                                            <DropdownMenuItem className="cursor-pointer font-bold text-red-600 focus:text-red-700 focus:bg-red-50 flex items-center gap-2 transition-colors py-2.5 outline-none">
                                                <Trash2 className="w-4 h-4" />
                                                Delete Module
                                            </DropdownMenuItem>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-black transition-colors">{moduleItem.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{moduleItem.description}</p>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold">{moduleItem.lessonCount} lessons</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {modules.length === 0 && !loading && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                            <BookOpen className="w-10 h-10 text-gray-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-900 font-bold">No modules found</p>
                            <p className="text-gray-400 text-sm">Add a module to get started.</p>
                        </div>
                    </div>
                )}
            </div>

            {courseId && (
                <CreateModuleModal
                    courseId={courseId}
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={fetchModules}
                />
            )}

            <EditModuleModal
                moduleItem={moduleToEdit}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setTimeout(() => setModuleToEdit(null), 300);
                }}
                onSuccess={fetchModules}
            />

            <AdminManageQuizModal
                moduleItem={moduleToManageQuiz}
                isOpen={isQuizModalOpen}
                onClose={() => {
                    setIsQuizModalOpen(false);
                    setTimeout(() => setModuleToManageQuiz(null), 300);
                }}
            />

            <DeleteModuleModal
                moduleId={moduleToDelete}
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTimeout(() => setModuleToDelete(null), 300);
                }}
                onSuccess={() => {
                    fetchModules();
                }}
            />
        </div>
    );
};

export default AdminModulesPage;
