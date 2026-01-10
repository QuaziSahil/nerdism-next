'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Save, Eye, Layout, LogOut, Check, AlertCircle,
    Loader, Clock, FileText, Hash, Monitor, Maximize2
} from 'lucide-react';
import { createPost, setAdminAuthenticated, isAdminAuthenticated, verifyAdminPassword } from '@/lib/firebase';
import SEOAnalyzer from '@/components/SEOAnalyzer/SEOAnalyzer';
import ImageUploader from '@/components/ImageUploader/ImageUploader';
import PostPreview from '@/components/PostPreview/PostPreview';
import SocialPreview from '@/components/SocialPreview/SocialPreview';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor';
import { CATEGORIES } from '@/constants/categories';
import './Editor.css';

const EditorPage = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const [post, setPost] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Tech',
        image: '',
        focusKeyword: ''
    });

    const [isPreview, setIsPreview] = useState(false);
    const [showFullPreview, setShowFullPreview] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [saveMessage, setSaveMessage] = useState('');
    const [lastSaved, setLastSaved] = useState(null);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

    // Authentication Check
    useEffect(() => {
        if (isAdminAuthenticated()) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleAuth = (e) => {
        e.preventDefault();
        if (verifyAdminPassword(password)) {
            setAdminAuthenticated(true);
            setIsAuthenticated(true);
        } else {
            setAuthError('Invalid password');
        }
    };

    // Helper to generate slug
    const generateSlug = (text) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    // Calculate stats
    const textContent = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textContent.split(/\s+/).filter(w => w.length > 0).length;
    const characters = textContent.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const keywordDensity = (() => {
        if (!post.focusKeyword || !textContent || words === 0) return 0;
        const escapedKeyword = post.focusKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
        const matches = textContent.match(regex);
        return matches ? ((matches.length / words) * 100).toFixed(1) : 0;
    })();

    // Auto-save to localStorage
    useEffect(() => {
        if (!isAuthenticated) return;
        const saved = localStorage.getItem('nerdism_draft');
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                setPost(draft);
                setLastSaved(new Date(draft.savedAt));
                if (draft.slug && draft.slug !== generateSlug(draft.title)) {
                    setIsSlugManuallyEdited(true);
                }
            } catch (e) { }
        }
    }, [isAuthenticated]);

    // Auto-generate slug from title if not manually edited
    useEffect(() => {
        if (!isSlugManuallyEdited && post.title) {
            const newSlug = generateSlug(post.title);
            setPost(prev => ({ ...prev, slug: newSlug }));
        }
    }, [post.title, isSlugManuallyEdited]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const timer = setTimeout(() => {
            if (post.title || post.content) {
                localStorage.setItem('nerdism_draft', JSON.stringify({
                    ...post,
                    savedAt: new Date().toISOString()
                }));
                setLastSaved(new Date());
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [post, isAuthenticated]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPost(prev => ({ ...prev, [name]: value }));
        if (name === 'slug') {
            setIsSlugManuallyEdited(true);
        }
    };

    const handlePublish = async () => {
        if (!post.title.trim() || !post.content.trim()) {
            setSaveStatus('error');
            setSaveMessage('Title and content are required');
            return;
        }

        setSaveStatus('saving');
        setSaveMessage('');

        const result = await createPost(post);

        if (result.success) {
            setSaveStatus('success');
            setSaveMessage(`Published! View at /blog/${result.slug}`);
            localStorage.removeItem('nerdism_draft');

            setTimeout(() => {
                setPost({ title: '', slug: '', excerpt: '', content: '', category: 'Tech', image: '', focusKeyword: '' });
                setIsSlugManuallyEdited(false);
                setSaveStatus('idle');
                setSaveMessage('');
            }, 3000);
        } else {
            setSaveStatus('error');
            setSaveMessage(result.message);
        }
    };

    const handleLogout = () => {
        setAdminAuthenticated(false);
        setIsAuthenticated(false);
    };

    const clearDraft = () => {
        localStorage.removeItem('nerdism_draft');
        setPost({ title: '', slug: '', excerpt: '', content: '', category: 'Tech', image: '', focusKeyword: '' });
        setIsSlugManuallyEdited(false);
        setLastSaved(null);
    };

    if (!isAuthenticated) {
        return (
            <div className="editor-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Admin Login</h2>
                    <form onSubmit={handleAuth}>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ textAlign: 'center' }}
                            />
                            {authError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>{authError}</p>}
                        </div>
                        <button type="submit" className="action-btn primary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="editor-container">
            {showFullPreview && (
                <PostPreview
                    post={post}
                    onClose={() => setShowFullPreview(false)}
                />
            )}

            <div className="editor-topbar">
                <div className="topbar-left">
                    <h1>✍️ NerDism Editor</h1>
                    {lastSaved && (
                        <span className="auto-saved">
                            Draft saved {lastSaved.toLocaleTimeString()}
                        </span>
                    )}
                </div>
                <div className="topbar-actions">
                    <button
                        className={`action-btn ${isPreview ? 'active' : ''}`}
                        onClick={() => setIsPreview(!isPreview)}
                    >
                        <Eye size={18} />
                        {isPreview ? 'Edit' : 'Preview'}
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => setShowFullPreview(true)}
                    >
                        <Maximize2 size={18} />
                        Full Preview
                    </button>
                    <button className="action-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        Logout
                    </button>
                    <button
                        className="action-btn primary"
                        onClick={handlePublish}
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? (
                            <><Loader size={18} className="spin" /> Publishing...</>
                        ) : saveStatus === 'success' ? (
                            <><Check size={18} /> Published!</>
                        ) : (
                            <><Save size={18} /> Publish</>
                        )}
                    </button>
                </div>
            </div>

            {saveMessage && (
                <motion.div
                    className={`save-message ${saveStatus}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {saveStatus === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                    <span>{saveMessage}</span>
                </motion.div>
            )}

            <div className="shortcuts-hint">
                <span>💡 Shortcuts: <kbd>Ctrl+B</kbd> Bold • <kbd>Ctrl+I</kbd> Italic • <kbd>Ctrl+U</kbd> Underline</span>
            </div>

            <div className="editor-layout">
                <div className="editor-main-panel">
                    <div className="form-group title-group">
                        <input
                            type="text"
                            name="title"
                            value={post.title}
                            onChange={handleChange}
                            placeholder="Enter an awesome title..."
                            className="title-input"
                        />
                        <span className={`char-hint ${post.title.length > 60 ? 'warning' : ''}`}>
                            {post.title.length}/60
                        </span>
                    </div>

                    <div className="form-group slug-group">
                        <label className="slug-label">Permalink:</label>
                        <div className="slug-input-wrapper">
                            <span className="slug-prefix">nerdism.me/blog/</span>
                            <input
                                type="text"
                                name="slug"
                                value={post.slug}
                                onChange={handleChange}
                                placeholder="my-awesome-post-url"
                                className="slug-input"
                            />
                        </div>
                    </div>

                    <div className="meta-row">
                        <div className="form-group">
                            <label><Hash size={14} /> Focus Keyword</label>
                            <input
                                type="text"
                                name="focusKeyword"
                                value={post.focusKeyword}
                                onChange={handleChange}
                                placeholder="e.g., web animations"
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={post.category} onChange={handleChange}>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Featured Image</label>
                        <ImageUploader
                            value={post.image}
                            onChange={(url) => setPost(prev => ({ ...prev, image: url }))}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FileText size={14} /> Meta Description (Excerpt)
                            <span className={`char-hint ${post.excerpt.length > 160 ? 'warning' : ''}`}>
                                {post.excerpt.length}/160
                            </span>
                        </label>
                        <textarea
                            name="excerpt"
                            value={post.excerpt}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Short summary for search results..."
                        />
                    </div>

                    {isPreview ? (
                        <div className="preview-pane">
                            <h1>{post.title}</h1>
                            {post.image && <img src={post.image} alt="Cover" className="preview-cover" />}
                            <div
                                className="preview-content"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>
                    ) : (
                        <RichTextEditor
                            content={post.content}
                            onChange={(html) => setPost(prev => ({ ...prev, content: html }))}
                            placeholder="Start writing your amazing content..."
                            title={post.title}
                            description={post.excerpt}
                        />
                    )}

                    <div className="stats-bar">
                        <span><FileText size={14} /> {words} words</span>
                        <span>{characters} characters</span>
                        <span><Clock size={14} /> {readingTime} min read</span>
                        <span className={`density ${keywordDensity > 2.5 ? 'warning' : ''}`}>
                            🎯 Density: {keywordDensity}%
                        </span>
                        {lastSaved && (
                            <button className="clear-draft-btn" onClick={clearDraft}>Clear Draft</button>
                        )}
                    </div>
                </div>

                <aside className="editor-sidebar">
                    <SEOAnalyzer
                        title={post.title}
                        excerpt={post.excerpt}
                        content={post.content}
                        focusKeyword={post.focusKeyword}
                        hasImage={!!post.image}
                    />
                    <SocialPreview
                        title={post.title}
                        excerpt={post.excerpt}
                        image={post.image}
                        slug={post.slug}
                    />
                </aside>
            </div>
        </div>
    );
};

export default EditorPage;
