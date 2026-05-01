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

export default function SEO({
    title,
    description,
    keywords
}: SEOProps) {
    const seo = {
        title: title ? `${title} | CodeQuest` : defaultSEO.title,
        description: description || defaultSEO.description,
        keywords: keywords || defaultSEO.keywords
    };

    useEffect(() => {
        // Update document title
        document.title = seo.title;

        // Update or create meta tags
        const updateMetaTag = (name: string, content: string, property?: boolean) => {
            const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let meta = document.querySelector(selector) as HTMLMetaElement;
            
            if (!meta) {
                meta = document.createElement('meta');
                if (property) {
                    meta.setAttribute('property', name);
                } else {
                    meta.setAttribute('name', name);
                }
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // Basic meta tags
        updateMetaTag('description', seo.description);
        updateMetaTag('keywords', seo.keywords);

        // Open Graph tags
        updateMetaTag('og:title', seo.title, true);
        updateMetaTag('og:description', seo.description, true);
        updateMetaTag('og:type', 'website', true);
        updateMetaTag('og:site_name', 'CodeQuest - SRKR Coding Club', true);

        // Twitter tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', seo.title);
        updateMetaTag('twitter:description', seo.description);

    }, [seo.title, seo.description, seo.keywords]);

    return null;
}