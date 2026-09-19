import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, TreePine, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import DepthCarousel from '../components/DepthCarousel';

function KPICard({ title, value, icon, trend, trendUp, trendDown, alert }) {
 return (
 <div className={`glass-panel p-5 rounded-2xl border ${alert ? 'border-danger/30 bg-danger/5' : 'border-successorder'} glass-panel-hover group overflow-hidden relative`}>
 <div className="absolute -right-6 -top-6 opacity-10 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
 {icon}
 </div>
 <div className="flex justify-between items-start mb-4 relative z-10">
 <div className={`p-3 rounded-xl ${alert ? 'bg-danger/20 text-danger' : 'bg-surface-3 text-accent group-hover:bg-accent group-hover:text-on-accent'} transition-all duration-300 shadow-lg shadow-black/20`}>
 {icon}
 </div>
 {trend && (
 <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
 trendUp ? 'bg-danger/10 text-danger' : trendDown ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-successlack/40 text-text-secondary'
 }`}>
 {trend}
 </span>
 )}
 </div>
 <div className="relative z-10">
 <h3 className="text-text-secondary text-sm font-medium mb-1">{title}</h3>
 <p className={`text-3xl font-bold font-heading tracking-wider ${alert ? 'text-danger' : 'text-text'}`}>{value}</p>
 </div>
 </div>
 );
}

export default function Dashboard() {
 const [analysisRuns, setAnalysisRuns] = useState([]);
 const navigate = useNavigate();

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 try {
 const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/analysis/`);
 setAnalysisRuns(res.data);
 } catch (error) {
 console.error('Error fetching data:', error);
 }
 };

 const viewAnalysis = (id) => {
 navigate(`/analysis?id=${id}`);
 };

 const carouselItems = [
 { image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=800', alt: 'Tiger' },
 { image: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=800', alt: 'Dark Forest' },
 { image: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=800', alt: 'Leopard' },
 { image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?q=80&w=800', alt: 'Sea Turtle' }
 ];

 return (
 <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
 
 {/* Featured Wildlife Showcase */}
 <div className="w-full h-[300px] lg:h-[400px] glass-panel rounded-3xl overflow-hidden border border-successorder relative shadow-2xl">
 <div className="absolute top-6 left-8 z-10">
 <h2 className="font-heading font-bold text-3xl text-text">Global <span className="text-accent">Wildlife</span> Watch</h2>
 <p className="text-text-secondary mt-1 font-light">Monitoring critical habitats in real-time</p>
 </div>
 <DepthCarousel 
 items={carouselItems}
 depth={150}
 spread={80}
 tilt={12}
 visibleCards={3}
 autoplay={true}
 autoplayDelay={4000}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <KPICard title="Total Monitoring Areas" value={analysisRuns.length} icon={<MapIcon size={28} />} />
 <KPICard title="Total Analyses" value={analysisRuns.length} icon={<Activity size={28} />} />
 <KPICard title="Critical Hotspots" value="12" alert icon={<AlertTriangle size={28} />} />
 <KPICard title="Avg NDVI Change" value="-2.4%" trend="-2.4%" trendDown icon={<TreePine size={28} />} />
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
 <div className="xl:col-span-2 glass-panel rounded-2xl p-6 border border-successorder shadow-xl">
 <div className="flex justify-between items-center mb-6">
 <h2 className="font-heading font-semibold text-xl flex items-center gap-3 text-accent">
 <TrendingUp size={20} />
 Recent Environmental Change Trends
 </h2>
 </div>
 <div className="h-[300px] w-full">
 {analysisRuns.length > 0 ? (
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={analysisRuns} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
 <XAxis dataKey="created_at" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => val ? val.substring(0,10) : ''} />
 <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
 <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} />
 <Legend wrapperStyle={{ paddingTop: '10px' }} />
 <Line type="monotone" dataKey="vegetation_change" name="Veg Change %" stroke="#10b981" strokeWidth={3} />
 <Line type="monotone" dataKey="urban_change" name="Urban Change %" stroke="#f59e0b" strokeWidth={2} />
 <Line type="monotone" dataKey="water_change" name="Water Change %" stroke="#06b6d4" strokeWidth={2} />
 </LineChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-full flex items-center justify-center text-text-muted">Loading chart data...</div>
 )}
 </div>
 </div>

 <div className="glass-panel rounded-2xl p-6 border border-successorder shadow-xl flex flex-col h-[400px]">
 <h2 className="font-heading font-semibold text-xl mb-6 flex items-center gap-3 text-accent">
 <Activity size={20} />
 Recent Analyses
 </h2>
 <div className="flex-1 overflow-y-auto pr-2 space-y-4">
 {analysisRuns.map(run => (
 <div key={run.id} className="p-4 bg-successlack/40 rounded-xl border border-successorder hover:border-accent/30 transition-colors group">
 <div className="flex justify-between items-start mb-3">
 <h3 className="font-medium text-sm text-text">{run.area_name}</h3>
 <span className={`tiny-label px-2 py-1 rounded-full border ${run.status === 'COMPLETED' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-accent/10 text-accent border-accent/20'}`}>
 {run.status}
 </span>
 </div>
 <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
 <div>Veg Change: <span className={`font-semibold ${run.vegetation_change < 0 ? 'text-danger' : 'text-[#10b981]'}`}>{run.vegetation_change?.toFixed(2)}%</span></div>
 <div>Urb Change: <span className={`font-semibold ${run.urban_change > 0 ? 'text-danger' : 'text-text-secondary'}`}>+{run.urban_change?.toFixed(2)}%</span></div>
 </div>
 <button onClick={() => viewAnalysis(run.id)} className="mt-4 w-full py-2 bg-surface-3 hover:bg-accent hover:text-[#0a0f0d] text-xs font-semibold rounded-lg transition-all text-accent border border-accent/20">
 View Results
 </button>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
