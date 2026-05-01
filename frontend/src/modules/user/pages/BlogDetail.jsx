import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { Calendar, User, Share2, ArrowLeft } from 'lucide-react';

const BlogDetail = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${slug}`);
                if (res && res.data) {
                    setPost(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch post:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) return <div className="p-10 text-center font-black uppercase text-xs tracking-widest animate-pulse">Opening Article...</div>;
    if (!post) return <div className="p-10 text-center font-black uppercase text-xs tracking-widest">Article Not Found.</div>;

    return (
        <div className="animate-slide-up bg-white min-h-screen pb-32">
            <div className="relative h-[400px]">
                <img 
                    src={post.image || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80'} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="absolute bottom-10 left-6 right-6">
                    <div className="bg-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded-full w-fit mb-4 shadow-lg">
                        {post.category?.replace('_', ' ')}
                    </div>
                    <h1 className="text-3xl font-black text-white leading-tight mb-4">{post.title}</h1>
                    <div className="flex items-center gap-4 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><User size={12} /> Admin</span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-10">
                <div 
                    className="prose prose-sm max-w-none text-obsidian font-medium leading-relaxed blog-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
                <div className="mt-12 pt-8 border-t border-black/5 flex items-center justify-between">
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                        <Share2 size={14} /> Share News
                    </button>
                    <div className="flex gap-2">
                        {post.tags?.map(tag => (
                            <span key={tag} className="text-[8px] font-bold text-gray-400 border border-black/5 px-2 py-1 rounded-md uppercase">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .blog-content h1, .blog-content h2, .blog-content h3 { font-weight: 900; margin-top: 2rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: -0.025em; }
                .blog-content p { margin-bottom: 1.5rem; color: #4B5563; }
                .blog-content img { border-radius: 24px; margin: 2rem 0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            `}} />
        </div>
    );
};

export default BlogDetail;
