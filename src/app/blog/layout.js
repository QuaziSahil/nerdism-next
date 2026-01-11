export const metadata = {
    title: 'Blog | NerDism - The Modern Nerd',
    description: 'Explore tech, gaming, anime, movies, AI, and everything nerdy. Quality articles written by humans.',
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'Blog | NerDism',
        description: 'Explore tech, gaming, anime, movies, AI, and everything nerdy.',
        url: 'https://nerdism.me/blog',
        type: 'website',
    },
};

export default function BlogLayout({ children }) {
    return children;
}
