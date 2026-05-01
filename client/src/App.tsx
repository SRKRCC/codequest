import { Navigate, BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, Suspense, lazy } from 'react';
import { setNavigateFunction } from './lib/axios';
import Home from './components/Home';
import LoginPage from './components/Login';
import RegisterPage from './components/SignUp';
import AboutPage from './components/About';
import PrivacyPolicyPage from './components/PrivacyPolicy';
import TermsConditionsPage from './components/TermsConditions';
import ProfilePage from './components/ProfilePage';
import ResetPassword from './components/ResetPassword.tsx';
import ForgotPassword from './components/ForgotPassword';
import EditProfile from './components/ProfilePage/profileEdit';
import Challenges from './components/Challenges';
import Footer from './components/footer';
import { Navbar } from './components/Navbar';
import SolutionPage from './components/Challenges/solutionPage';
import NotFoundPage from './components/Error404';
import RouteSEO from './components/RouteSEO';
import { ServerErrorRoute, NetworkErrorRoute, UnauthorizedRoute } from './components/ErrorRoutes';
import { ForbiddenPage } from './components/EnhancedErrorPages';
import { useAdminStore } from './context/AdminContext.tsx';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load heavier user components
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const ProblemSet = lazy(() => import('./components/ProblemSet'));
const CategoryProblems = lazy(() => import('./components/ProblemSet/CategoryProblems'));

// Lazy load Admin components
const AddChallenge = lazy(() => import('./components/Admin/addChallenges'));
const UserDashboard = lazy(() => import('./components/Admin/Users'));
const Sidebar = lazy(() => import('./components/Admin/sidebar').then(module => ({ default: module.Sidebar })));
const AdminLogin = lazy(() => import('./components/Admin/index'));
const Dashboard = lazy(() => import('./components/Admin/Dashboard.tsx'));
const AdminChallenges = lazy(() => import('./components/Admin/AdminChallenges.tsx'));
const ChallengeDetail = lazy(() => import('./components/Admin/ChallengeDetails.tsx'));

function UserApp() {
  return (
    <div className="flex flex-col min-h-screen">
      <RouteSEO />
      <Navbar />
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsConditionsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/edit-profile" element={<EditProfile />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/challenges/solution/:slug" element={<SolutionPage />} />
          <Route path="/problemset" element={<ProblemSet />} />
          <Route path="/problemset/category/:categoryName" element={<CategoryProblems />} />
          {/* Enhanced Error Pages */}
          <Route path="/server-error" element={<ServerErrorRoute />} />
          <Route path="/network-error" element={<NetworkErrorRoute />} />
          <Route path="/unauthorized" element={<UnauthorizedRoute />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

function AdminApp() {
  const { token } = useAdminStore(); // Access the token from the store or context
  // If no token, show the login page
  if (!token) {
    return (
      <div className="flex-grow mt-16 md:mt-0">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/codingclubadmin" element={<AdminLogin />} />
            <Route path="*" element={<Navigate to="/codingclubadmin" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <div className="w-64 min-h-screen fixed left-0 top-0 bg-gray-800 text-white hidden md:block">
          <Sidebar />
        </div>
      </Suspense>
      <div className="flex-grow md:ml-64 pl-0 md:pl-4 mt-16 md:mt-0">
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* <Route path="/codingclubadmin" element={<AdminLogin />} /> */}
            <Route path="/codingclubadmin" element={<Dashboard />} />
            <Route path="/codingclubadmin/users" element={<UserDashboard />} />
            <Route path="/codingclubadmin/challenges" element={<AdminChallenges />} />
            <Route path="/codingclubadmin/challenges/:id" element={<ChallengeDetail />} />
            <Route path="/codingclubadmin/users/profile/:username" element={<ProfilePage />} />
            <Route path="/codingclubadmin/addchallenge" element={<AddChallenge />} />
            <Route path="/codingclubadmin/leaderboard" element={<Leaderboard />} />
            {/* Enhanced Error Pages for Admin */}
            <Route path="/codingclubadmin/server-error" element={<ServerErrorRoute />} />
            <Route path="/codingclubadmin/network-error" element={<NetworkErrorRoute />} />
            <Route path="/codingclubadmin/unauthorized" element={<UnauthorizedRoute />} />
            <Route path="/codingclubadmin/forbidden" element={<ForbiddenPage />} />
            <Route path="/codingclubadmin/*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Set up navigation function for axios interceptors
  useEffect(() => {
    setNavigateFunction(navigate);
  }, [navigate]);

  // Render AdminApp or UserApp based on path
  return location.pathname.startsWith("/codingclubadmin") ? (
    <AdminApp />
  ) : (
    <UserApp />
  );
}

export default function MainApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}