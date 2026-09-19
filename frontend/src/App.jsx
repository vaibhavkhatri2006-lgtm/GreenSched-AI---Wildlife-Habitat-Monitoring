import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Map as MapIcon, Settings, Activity, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import MonitorArea from './pages/MonitorArea';
import Analysis from './pages/Analysis';
import './App.css';

const Welcome = React.lazy(() => import('./pages/Welcome'));

// Axios Interceptor for Auth
axios.interceptors.request.use(config => {
 const token = localStorage.getItem('token');
 if (token) config.headers.Authorization = `Bearer ${token}`;
 return config;
});

function Login({ setAuth }) {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 
 const handleLogin = async (e) => {
 e.preventDefault();
 try {
 const formData = new URLSearchParams();
 formData.append('username', email);
 formData.append('password', password);
 
 const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, formData);
 localStorage.setItem('token', res.data.access_token);
 setAuth(true);
 } catch (err) {
 setError('Invalid credentials');
 }
 };

 return (
 <div className="flex h-screen items-center justify-center bg-successg text-text">
 <div className="glass-panel p-10 rounded-2xl w-[26rem]">
 <h2 className="text-4xl font-heading font-bold mb-6 text-text tracking-wider">WILD<span className="text-accent">LIFE</span></h2>
 <p className="text-sm text-text-secondary mb-6">Monitor Earth's changing habitats.</p>
 {error && <p className="text-danger text-sm mb-4">{error}</p>}
 <form onSubmit={handleLogin} className="space-y-4">
 <div>
 <label className="block text-sm mb-1 text-text-secondary">Email</label>
 <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-surface-1 border border-successorder rounded px-3 py-2 text-text" required />
 </div>
 <div>
 <label className="block text-sm mb-1 text-text-secondary">Password</label>
 <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-surface-1 border border-successorder rounded px-3 py-2 text-text" required />
 </div>
 <button type="submit" className="w-full btn-primary py-3 rounded-lg font-medium transition-colors mt-6">Sign In</button>
 </form>
 <p className="mt-6 text-sm text-center text-text-secondary">
 Don't have an account? <Link to="/signup" className="text-accent hover:text-text transition-colors">Create account</Link>
 </p>
 </div>
 </div>
 );
}

function Signup({ setAuth }) {
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();
 
 const handleSignup = async (e) => {
 e.preventDefault();
 setError('');

 if (password.length < 8) {
 return setError('Password must be at least 8 characters.');
 }
 if (password !== confirmPassword) {
 return setError('Passwords do not match.');
 }

 setLoading(true);
 try {
 const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
 name,
 email,
 password
 });
 // Registration successful, now automatically log them in
 const formData = new URLSearchParams();
 formData.append('username', email);
 formData.append('password', password);
 
 const loginRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, formData);
 localStorage.setItem('token', loginRes.data.access_token);
 setAuth(true);
 navigate('/');
 } catch (err) {
 if (err.response && err.response.data && err.response.data.detail) {
 setError(err.response.data.detail); // e.g."Email already registered"
 } else {
 setError('Server error during registration.');
 }
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="flex h-screen items-center justify-center bg-successg text-text">
 <div className="glass-panel p-10 rounded-2xl w-[26rem]">
 <h2 className="text-4xl font-heading font-bold mb-6 text-text tracking-wider">WILD<span className="text-accent">LIFE</span></h2>
 <p className="text-sm text-text-secondary mb-6">Start monitoring environmental change.</p>
 {error && <p className="text-danger text-sm mb-4">{error}</p>}
 <form onSubmit={handleSignup} className="space-y-4">
 <div>
 <label className="block text-sm mb-1 text-text-secondary">Full Name</label>
 <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-surface-1 border border-successorder rounded px-3 py-2 text-text" required />
 </div>
 <div>
 <label className="block text-sm mb-1 text-text-secondary">Email</label>
 <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-surface-1 border border-successorder rounded px-3 py-2 text-text" required />
 </div>
 <div>
 <label className="block text-sm mb-1 text-text-secondary">Password</label>
 <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-surface-1 border border-successorder rounded px-3 py-2 text-text" required />
 </div>
 <div>
 <label className="block text-sm mb-1 text-text-secondary">Confirm Password</label>
 <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="w-full bg-surface-1 border border-successorder rounded px-3 py-2 text-text" required />
 </div>
 <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-lg font-medium transition-colors mt-6">
 {loading ? 'Creating account...' : 'Create Account'}
 </button>
 </form>
 <p className="mt-6 text-sm text-center text-text-secondary">
 Already have an account? <Link to="/login" className="text-accent hover:text-text transition-colors">Sign in</Link>
 </p>
 </div>
 </div>
 );
}

function Sidebar({ setAuth }) {
 const location = useLocation();
 const [isOpen, setIsOpen] = useState(true);

 const navItems = [
 { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
 { path: '/monitor', icon: <MapIcon size={20} />, label: 'Monitor Area' },
 { path: '/analysis', icon: <Activity size={20} />, label: 'Analysis Results' }
 ];

 const handleLogout = () => {
 localStorage.removeItem('token');
 setAuth(false);
 };

 return (
 <aside className={`${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out glass-panel border-r border-successorder flex flex-col z-20`}>
 <div className="p-4 flex items-center justify-between border-success border-successorder h-16">
 {isOpen && <span className="font-heading font-bold text-xl text-text tracking-wider">WILD<span className="text-accent">LIFE</span></span>}
 <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-text transition-colors">
 <Settings size={20} />
 </button>
 </div>
 <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
 {navItems.map(item => (
 <Link key={item.path} to={item.path} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
 location.pathname === item.path 
 ? 'bg-surface-3 text-accent shadow-lg' 
 : 'text-text-secondary hover:bg-white/5 hover:text-text'
 }`}>
 {item.icon}
 {isOpen && <span className="font-medium text-sm">{item.label}</span>}
 </Link>
 ))}
 </nav>
 <div className="p-4 border-t border-successorder">
 <button onClick={handleLogout} className="flex items-center gap-3 w-full p-2 text-text-secondary hover:text-danger transition-colors">
 <LogOut size={20} />
 {isOpen && <span className="font-medium text-sm">Logout</span>}
 </button>
 </div>
 </aside>
 );
}

function Header() {
 return (
 <header className="h-16 glass-panel border-success border-x-0 border-t-0 flex items-center justify-between px-6 sticky top-0 z-10 rounded-none">
 <h1 className="font-heading font-semibold text-2xl text-text/90">Console</h1>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2 text-sm bg-successlack/40 px-3 py-1.5 rounded-full border border-successorder">
 <span className="relative flex h-2.5 w-2.5">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
 </span>
 <span className="text-text-secondary font-medium tracking-wide">{import.meta.env.VITE_DEMO_MODE === 'true' ? 'Demo Mode' : 'Live Satellite'}</span>
 </div>
 </div>
 </header>
 );
}

function MainLayout({ setAuth }) {
 return (
 <div className="flex h-screen bg-successg text-text overflow-hidden font-sans relative">
 {/* Immersive background overlay */}
 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000')] bg-cover bg-center opacity-[0.25] mix-blend-luminosity pointer-events-none"></div>
 
 <Sidebar setAuth={setAuth} />
 <main className="flex-1 flex flex-col h-full overflow-hidden relative">
 <Header />
 <div className="flex-1 overflow-y-auto scroll-smooth p-6">
 <Routes>
 <Route path="/" element={<Dashboard />} />
 <Route path="/monitor" element={<MonitorArea />} />
 <Route path="/analysis" element={<Analysis />} />
 </Routes>
 </div>
 </main>
 </div>
 );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-center text-danger">Something went wrong loading the landing page.</div>;
    }
    return this.props.children;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={!isAuthenticated ? (
          <ErrorBoundary>
            <React.Suspense fallback={<div className="flex h-screen items-center justify-center bg-bg text-text">Loading...</div>}>
              <Welcome />
            </React.Suspense>
          </ErrorBoundary>
        ) : <MainLayout setAuth={setIsAuthenticated} />} />
        <Route path="/login" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
