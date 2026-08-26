import React, { useEffect, useState } from 'react';
import { BookOpen, Search, LayoutGrid, Clock, PlayCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getCourses } from '../../api/course';
import type { Course } from '../../api/course';
import { useNavigate } from 'react-router-dom';

const resolveUrl = (url: string | null | undefined): string => {
    if (!url) return '/logo.jpg';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${url}`;
};

const GuardLearningHub: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

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

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with brand feel */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">LEARNING HUB</h1>
                    <p className="text-[10px] font-bold text-[#d0a868] uppercase tracking-[0.2em] mt-1">Acquire & Master Skills</p>
                </div>
                
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="SEARCH COURSES..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#d0a868] focus:ring-1 focus:ring-[#d0a868] transition-all placeholder:text-gray-300 shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                    <div
                        key={course.id}
                        onClick={() => navigate(`/guard/learning-hub/${course.id}`)}
                        className="cursor-pointer bg-white border border-gray-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col hover:border-[#d0a868]/30"
                    >
                        <div className="aspect-[16/10] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                            <img 
                                src={resolveUrl(course.thumbnail)} 
                                alt={course.title} 
                                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            />

                            <div className="absolute top-4 right-4">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 bg-black/60 text-white group-hover:bg-[#d0a868] transition-colors">
                                    AVAILABLE
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-1 space-y-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 group-hover:text-[#d0a868] transition-colors leading-tight line-clamp-1">{course.title}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-[#d0a868] animate-pulse" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enroll Now</span>
                                </div>
                            </div>
                            
                            <p className="text-xs font-medium text-gray-500 line-clamp-2 flex-1 leading-relaxed">{course.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{course.moduleCount}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{course.lessonCount}</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#d0a868] group-hover:text-white transition-all">
                                    <PlayCircle className="w-4 h-4 ml-0.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCourses.length === 0 && !loading && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white border border-dashed border-gray-200 rounded-[2.5rem]">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                            <BookOpen className="w-10 h-10 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-gray-900">No courses available</p>
                            <p className="text-gray-400 text-sm max-w-xs mx-auto">You haven't been assigned any training modules yet. Check back later for updates.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuardLearningHub;
