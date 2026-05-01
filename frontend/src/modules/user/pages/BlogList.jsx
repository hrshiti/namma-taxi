import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { Calendar, User, ArrowRight, ChevronRight } from 'lucide-react';

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await api.get('/posts');
                if (res && res.data) {
                    setPosts(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-100 h-48 rounded-[32px] animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="animate-slide-up px-6 pt-6">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">Taxi News & Tips</h1>
            </div>

            <div className="space-y-6 mb-32">
                {posts.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-10 text-center border border-black/5">
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No articles found yet.</p>
                    </div>
                ) : posts.map(post => (
                    <div 
                        key={post._id} 
                        onClick={() => navigate(`/user/blog/${post.slug}`)}
                        className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-black/5 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <div className="h-48 relative overflow-hidden bg-gray-100">
                            <img 
                                src={post.image || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80'} 
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                                {post.category?.replace('_', ' ')}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><User size={12} /> Admin</span>
                            </div>
                            <h2 className="text-lg font-black leading-tight mb-3 text-obsidian">{post.title}</h2>
                            <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                                {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group">
                                    Read Article <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogList;
