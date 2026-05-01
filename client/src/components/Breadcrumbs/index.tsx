import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

const pathNameMap: Record<string, string> = {
    '': 'Home',
    'about': 'About Us',
    'challenges': 'Challenges', 
    'leaderboard': 'Leaderboard',
    'register': 'Sign Up',
    'login': 'Login',
    'profile': 'Profile',
    'privacy-policy': 'Privacy Policy',
    'terms-conditions': 'Terms & Conditions'
};

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (location.pathname === '/') {
        return null;
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', path: '/' }
    ];

    let currentPath = '';
    pathnames.forEach((pathname, index) => {
        currentPath += `/${pathname}`;
        const isLast = index === pathnames.length - 1;
        
        breadcrumbs.push({
            label: pathNameMap[pathname] || pathname,
            path: isLast ? undefined : currentPath
        });
    });

    return (
        <nav aria-label="Breadcrumb" className="bg-gray-50 dark:bg-gray-900/50 py-3 px-4 border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto">
                <ol className="flex items-center space-x-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                            )}
                            {crumb.path ? (
                                <Link
                                    to={crumb.path}
                                    className="flex items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors"
                                >
                                    {index === 0 && <Home className="w-4 h-4 mr-1" />}
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                                    {index === 0 && <Home className="w-4 h-4 mr-1" />}
                                    {crumb.label}
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </div>

            {/* Structured Data for Breadcrumbs */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": breadcrumbs.map((crumb, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "name": crumb.label,
                        "item": crumb.path ? `https://codequest.srkrcodingclub.com${crumb.path}` : undefined
                    }))
                })}
            </script>
        </nav>
    );
}