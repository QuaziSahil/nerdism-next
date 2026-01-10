"use client";

// Simple text icons - 100% guaranteed to work in any environment
const iconStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

export default function ShareButtons({ title }) {
    const handleShare = (platform) => {
        const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
        const shareTitle = title || 'Check out this article';

        const urls = {
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        };

        if (platform === 'native' && navigator.share) {
            navigator.share({ title: shareTitle, url: shareUrl });
        } else if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    };

    return (
        <div className="share-buttons">
            <button className="share-btn twitter" onClick={() => handleShare('twitter')} title="Share on Twitter" style={{ color: '#fff' }}>
                <span style={iconStyle}>𝕏</span>
            </button>
            <button className="share-btn facebook" onClick={() => handleShare('facebook')} title="Share on Facebook" style={{ color: '#fff' }}>
                <span style={iconStyle}>f</span>
            </button>
            <button className="share-btn linkedin" onClick={() => handleShare('linkedin')} title="Share on LinkedIn" style={{ color: '#fff' }}>
                <span style={iconStyle}>in</span>
            </button>
            <button className="share-btn native" onClick={() => handleShare('native')} title="Share" style={{ color: '#fff' }}>
                <span style={iconStyle}>⤴</span>
            </button>
        </div>
    );
}
