import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
}

const defaultSEO = {
    title: "CodeQuest - Daily Coding Challenges | SRKR Coding Club",
    description: "Join CodeQuest by SRKR Coding Club for daily coding challenges, leaderboards, and programming competitions. Enhance your coding skills with our interactive platform.",
    keywords: "coding challenges, programming contests, SRKR coding club, daily coding problems, leaderboard, competitive programming, software development, coding practice"
};

export default function SEO({ title, description, keywords }: SEOProps) {
    useEffect(() => {
        document.title = title ? `${title} | CodeQuest` : defaultSEO.title;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description || defaultSEO.description);
        }
        
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute('content', keywords || defaultSEO.keywords);
        }
    }, [title, description, keywords]);

    return null;
}