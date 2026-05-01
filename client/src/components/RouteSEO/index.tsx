import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const pageMetadata = {
  '/': {
    title: 'Home',
    description: 'Join CodeQuest by SRKR Coding Club for daily coding challenges, leaderboards, and programming competitions. Enhance your coding skills with our interactive platform.',
    keywords: 'coding challenges, programming contests, SRKR coding club, daily coding problems, leaderboard, competitive programming'
  },
  '/about': {
    title: 'About Us',
    description: 'Learn about SRKR Coding Club, our mission, team, and achievements. Founded in 2023, we are dedicated to fostering coding excellence among students.',
    keywords: 'SRKR Engineering College, coding club, about us, team, student programming community, Bhimavaram'
  },
  '/challenges': {
    title: 'Coding Challenges',
    description: 'Explore daily coding challenges, practice problems, and improve your programming skills. Compete with peers and climb the leaderboard.',
    keywords: 'coding challenges, programming problems, practice coding, algorithm challenges, data structures'
  },
  '/leaderboard': {
    title: 'Leaderboard',
    description: 'Check the coding challenge leaderboard, see top performers, and track your ranking among SRKR coding enthusiasts.',
    keywords: 'coding leaderboard, programming ranking, top coders, competition results, coding scores'
  },
  '/register': {
    title: 'Sign Up',
    description: 'Create your CodeQuest account and start participating in daily coding challenges. Join the SRKR Coding Club community today.',
    keywords: 'sign up, register, create account, join coding club, student registration'
  },
  '/login': {
    title: 'Login',
    description: 'Login to your CodeQuest account to access coding challenges, track your progress, and compete on the leaderboard.',
    keywords: 'login, sign in, access account, coding platform login'
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'Read our privacy policy to understand how we collect, use, and protect your personal information on the CodeQuest platform.',
    keywords: 'privacy policy, data protection, user privacy, information security'
  },
  '/terms-conditions': {
    title: 'Terms & Conditions',
    description: 'Review the terms and conditions for using the CodeQuest platform by SRKR Coding Club.',
    keywords: 'terms and conditions, user agreement, platform rules, terms of service'
  }
};

export default function RouteSEO() {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const metadata = pageMetadata[currentPath as keyof typeof pageMetadata];

    if (metadata) {
      document.title = `${metadata.title} | CodeQuest - SRKR Coding Club`;

      const updateMetaTag = (name: string, content: string, property?: boolean) => {
        const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        
        if (meta) {
          meta.setAttribute('content', content);
        }
      };

      updateMetaTag('description', metadata.description);
      updateMetaTag('keywords', metadata.keywords);
      updateMetaTag('og:title', `${metadata.title} | CodeQuest - SRKR Coding Club`, true);
      updateMetaTag('og:description', metadata.description, true);
      updateMetaTag('twitter:title', `${metadata.title} | CodeQuest - SRKR Coding Club`);
      updateMetaTag('twitter:description', metadata.description);
    }
  }, [location.pathname]);

  return null;
}