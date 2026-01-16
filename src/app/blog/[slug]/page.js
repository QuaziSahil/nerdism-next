// Server Component - NO "use client" - content renders on server!
import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { getPostBySlug, getPublishedPosts } from '@/lib/firebase';
import ShareButtons from '@/components/ShareButtons/ShareButtons';
import Comments from '@/components/Comments/Comments';
import './Post.css';

// ISR: Revalidate every hour (3600 seconds) - CRITICAL for reducing origin transfer
export const revalidate = 3600;

// Pre-render all blog posts at build time - reduces origin requests
export async function generateStaticParams() {
    const posts = await getPublishedPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return { title: 'Post Not Found | NerDism' };
    }

    return {
        title: `${post.title} | NerDism`,
        description: post.excerpt || post.title,
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: `https://nerdism.me/blog/${slug}`,
            images: post.image ? [post.image] : [],
            type: 'article',
        },
    };
}

// Helper functions
function renderContent(text) {
    if (!text) return '';
    const slugify = (text) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return text
        .replace(/^### (.*$)/gim, (match, title) => `<h3 id="${slugify(title)}">${title}</h3>`)
        .replace(/^## (.*$)/gim, (match, title) => `<h2 id="${slugify(title)}">${title}</h2>`)
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/\n/g, '<br/>');
}

function formatDate(dateValue) {
    if (!dateValue) return '';
    let date;
    if (dateValue?.seconds) {
        date = new Date(dateValue.seconds * 1000);
    } else if (dateValue?.toDate) {
        date = dateValue.toDate();
    } else {
        date = new Date(dateValue);
    }
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// SERVER COMPONENT - Data fetched on server, content in HTML!
export default async function PostPage({ params }) {
    const { slug } = await params;

    // Fetch post on server - this content will be in HTML source!
    const post = await getPostBySlug(slug);

    // Fetch related posts
    let relatedPosts = [];
    if (post) {
        const allPosts = await getPublishedPosts();
        relatedPosts = allPosts
            .filter(p => p.category === post.category && p.id !== post.id)
            .slice(0, 3);
    }

    // Not found
    if (!post) {
        return (
            <div className="container post-not-found">
                <h1>Post not found</h1>
                <p>The article you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/blog" className="back-link">
                    <ArrowLeft size={18} />
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <article className="post-page">
            {/* Hero Section - ALL THIS CONTENT IS NOW IN HTML SOURCE! */}
            <div className="post-hero">
                <div className="hero-content container">
                    <Link href="/blog" className="back-to-blog">
                        <ArrowLeft size={16} />
                        Back to Blog
                    </Link>

                    <span className="post-category-tag">
                        {post.category}
                    </span>

                    <h1 className="post-title-main">
                        {post.title}
                    </h1>

                    <div className="post-meta-detailed">
                        <div className="meta-group">
                            <User size={18} />
                            <span>{post.author?.name || 'Nerdism'}</span>
                        </div>
                        <div className="meta-group">
                            <Calendar size={18} />
                            <span>{formatDate(post.publishedAt)}</span>
                        </div>
                        <div className="meta-group">
                            <Clock size={18} />
                            <span>{post.readTime}</span>
                        </div>
                    </div>
                </div>

                {post.image && (
                    <div className="hero-image-wrapper">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="hero-image"
                        />
                        <div className="overlay"></div>
                    </div>
                )}
            </div>

            {/* Post Content - THIS IS THE CRITICAL PART FOR ADSENSE! */}
            <div className="post-container">
                <div className="post-content-body">
                    {post.excerpt && <p className="lead-paragraph">{post.excerpt}</p>}

                    {/* Article content - rendered on server, visible in HTML source! */}
                    <div
                        className="post-content-rendered"
                        dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
                    />

                    {/* Author Box */}
                    <div className="author-box">
                        <div className="author-avatar">
                            <span className="author-initial">N</span>
                        </div>
                        <div className="author-info">
                            <h4>Written by {post.author?.name || 'Nerdism'}</h4>
                            <p>Nerdism – For the True Nerds. Exploring tech, gaming, and digital culture with unfiltered passion.</p>
                        </div>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="related-posts">
                            <h3>Related Posts</h3>
                            <div className="related-grid">
                                {relatedPosts.map(relatedPost => (
                                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="related-card">
                                        <img src={relatedPost.image} alt={relatedPost.title} />
                                        <h4>{relatedPost.title}</h4>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comments Section - Client Component */}
                    <Comments postId={post.id} />
                </div>

                {/* Sidebar with Share Buttons - Client Component */}
                <aside className="post-sidebar">
                    <div className="sticky-sidebar">
                        <ShareButtons title={post.title} />
                    </div>
                </aside>
            </div>

            {/* Mobile Share Bar - Client Component */}
            <div className="mobile-share-bar">
                <div className="share-label">Share this article</div>
                <ShareButtons title={post.title} />
            </div>
        </article>
    );
}
