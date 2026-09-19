import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const [swipePos, setSwipePos] = useState(50);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    handlePointerMove(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX ?? e.touches[0].clientX;
    const pos = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
    setSwipePos(pos);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointermove', handlePointerMove);
    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setSwipePos((p) => Math.max(0, p - 2));
    else if (e.key === 'ArrowRight') setSwipePos((p) => Math.min(100, p + 2));
    else if (e.key === 'Home') setSwipePos(0);
    else if (e.key === 'End') setSwipePos(100);
  };

  return (
    <div className="welcome-container">
      {/* Top Nav */}
      <nav className="welcome-nav sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-bg border-b border-border">
        <div className="font-heading font-bold text-2xl text-text">
          WILD<span className="text-accent">LIFE</span>
        </div>
        <div className="hidden md:flex gap-8 items-center text-sm font-medium text-text-secondary">
          <a href="#features" className="hover:text-text transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-text transition-colors">How it works</a>
          <a href="#method" className="hover:text-text transition-colors">Method</a>
          <div className="flex gap-2 text-xs border border-border rounded p-1">
            <span className="bg-surface-2 px-2 py-1 rounded text-text cursor-default">EN</span>
            <span className="px-2 py-1 cursor-pointer hover:text-text">FR</span>
          </div>
          <button onClick={() => navigate('/login')} className="btn-primary ml-4">
            Open console
          </button>
        </div>
        <button className="md:hidden text-text p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </nav>

      {/* Hero */}
      <section className="welcome-hero relative min-h-[90vh] flex items-center pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000')] bg-cover bg-center">
          <div className="absolute inset-0 bg-bg opacity-80 mix-blend-multiply"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 slide-up">
            <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl leading-tight text-text text-balance">
              See how wild places are changing.
            </h1>
            <p className="text-lg text-text-secondary max-w-xl font-body">
              Compare satellite data across time and see forest, water and urban change on a map.
            </p>
            <div className="flex gap-4 mt-4">
              <button onClick={() => navigate('/signup')} className="btn-primary text-lg px-8 py-3">Start exploring</button>
              <a href="#how-it-works" className="text-text hover:bg-surface-1 px-6 py-3 rounded-lg border border-transparent hover:border-border transition-colors font-medium">How it works</a>
            </div>
          </div>

          <div className="w-full slide-up-delay">
            <div 
              ref={sliderRef}
              className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-border shadow-2xl cursor-ew-resize select-none touch-none bg-surface-2"
              onPointerDown={handlePointerDown}
              role="slider"
              aria-valuenow={Math.round(swipePos)}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Compare before and after"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              <div className="absolute top-4 left-4 bg-bg/80 backdrop-blur text-xs px-2 py-1 rounded text-text z-20 pointer-events-none">Sample imagery</div>
              
              {/* After image (Bottom layer) */}
              <div className="absolute inset-0">
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 560 400" className="w-full h-full">
                  <rect width="560" height="400" fill="#2d4233" />
                  <circle cx="200" cy="150" r="80" fill="#1d3023" />
                  {/* Deforestation / Urban */}
                  <path d="M 300 200 L 450 150 L 500 300 Z" fill="#F07A3C" opacity="0.6"/>
                  <rect x="100" y="250" width="150" height="80" fill="#8B5CF6" opacity="0.8"/>
                </svg>
                <div className="absolute bottom-4 right-4 bg-bg/80 backdrop-blur text-xs px-2 py-1 rounded text-text font-bold uppercase tracking-wider">After</div>
              </div>

              {/* Before image (Top layer) */}
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${swipePos}%` }}>
                <svg width="560" height="400" preserveAspectRatio="none" viewBox="0 0 560 400" className="h-full" style={{minWidth: '100%'}}>
                  <rect width="560" height="400" fill="#2d4233" />
                  <circle cx="200" cy="150" r="80" fill="#1d3023" />
                  <path d="M 300 200 L 450 150 L 500 300 Z" fill="#2d4233" />
                  <rect x="100" y="250" width="150" height="80" fill="#2d4233" />
                </svg>
                <div className="absolute bottom-4 left-4 bg-bg/80 backdrop-blur text-xs px-2 py-1 rounded text-text font-bold uppercase tracking-wider">Before</div>
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center transform -translate-x-1/2"
                style={{ left: `${swipePos}%` }}
              >
                <div className="w-6 h-10 bg-white rounded flex items-center justify-center shadow-lg">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-4 bg-gray-400"></div>
                    <div className="w-0.5 h-4 bg-gray-400"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-4 text-xs font-mono">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--color-vegetation-loss)]"></span> Vegetation loss</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--color-urban)]"></span> Urban expansion</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--color-water)]"></span> Water change</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Tiles */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bento-grid">
          
          <div className="lg:col-span-2 lg:row-span-2 bg-surface-1 border border-border rounded-2xl p-6 flex flex-col hover:border-border-strong hover:-translate-y-0.5 transition-all">
            <h3 className="font-heading text-xl text-text mb-4">Interactive map</h3>
            <div className="flex-1 bg-surface-2 rounded-xl border border-border relative overflow-hidden min-h-[200px]">
              <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-border) 1px, transparent 0)', backgroundSize: '16px 16px'}}></div>
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M 20 20 C 40 10, 80 40, 90 80 C 60 90, 30 70, 20 20 Z" fill="var(--color-protected)" opacity="0.4" stroke="var(--color-protected)" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className="bg-surface-1 border border-border rounded-2xl p-6 flex flex-col hover:border-border-strong hover:-translate-y-0.5 transition-all">
            <h3 className="font-heading text-lg text-text mb-2">Vegetation change</h3>
            <div className="flex-1 flex items-end">
              <div className="w-full h-12 flex items-end gap-1 opacity-80">
                {[4,7,5,8,9,6,4,3,2,1].map((h, i) => (
                  <div key={i} className="flex-1 bg-[var(--color-vegetation)] rounded-t" style={{height: `${h*10}%`}}></div>
                ))}
              </div>
            </div>
            <span className="text-[10px] text-text-muted mt-2 font-mono uppercase tracking-widest">Sample</span>
          </div>

          <div className="bg-surface-1 border border-border rounded-2xl p-6 flex flex-col hover:border-border-strong hover:-translate-y-0.5 transition-all">
            <h3 className="font-heading text-lg text-text mb-2">Urban expansion</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-16 h-16 rounded border-2 border-[var(--color-urban)] bg-[var(--color-urban)]/20 grid grid-cols-2 gap-1 p-1">
                <div className="bg-[var(--color-urban)]/40 rounded-sm"></div>
                <div className="bg-[var(--color-urban)]/60 rounded-sm"></div>
                <div className="bg-[var(--color-urban)]/80 rounded-sm"></div>
                <div className="bg-[var(--color-urban)] rounded-sm"></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-1 border border-border rounded-2xl p-6 flex flex-col hover:border-border-strong hover:-translate-y-0.5 transition-all">
            <h3 className="font-heading text-lg text-text mb-2">Water body change</h3>
            <div className="flex-1 flex items-center justify-center">
               <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--color-water)" fill="none" strokeWidth="1.5"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>
            </div>
          </div>

          <div className="lg:col-span-2 bg-surface-1 border border-border rounded-2xl p-6 flex flex-col hover:border-border-strong hover:-translate-y-0.5 transition-all">
            <h3 className="font-heading text-lg text-text mb-4">Before and after</h3>
            <div className="h-4 w-full flex rounded overflow-hidden">
              <div className="flex-1 bg-surface-3"></div>
              <div className="flex-1 bg-surface-2"></div>
            </div>
          </div>

          <div className="bg-surface-1 border border-border rounded-2xl p-6 flex flex-col hover:border-border-strong hover:-translate-y-0.5 transition-all">
            <h3 className="font-heading text-lg text-text mb-2">AI insight</h3>
            <p className="text-sm text-text-secondary leading-relaxed">AI explains measured changes. The numbers come from the analysis.</p>
          </div>

          <div className="bg-surface-1 border border-border rounded-2xl p-6 flex flex-col hover:border-border-strong hover:-translate-y-0.5 transition-all">
            <h3 className="font-heading text-lg text-text mb-2">Analysis history</h3>
            <div className="flex-1 border-t border-border mt-2 pt-2">
              <div className="h-2 w-3/4 bg-surface-2 rounded mb-2"></div>
              <div className="h-2 w-1/2 bg-surface-2 rounded mb-2"></div>
              <div className="h-2 w-2/3 bg-surface-2 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-surface-1 border-y border-border py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-heading text-3xl text-text mb-12 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { n: '1', t: 'Select an area' },
              { n: '2', t: 'Choose two time periods' },
              { n: '3', t: 'Run the analysis' },
              { n: '4', t: 'Review hotspots' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center font-mono text-accent text-xl bg-surface-2">{step.n}</div>
                <div className="font-medium text-text">{step.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Method & Limits */}
      <section id="method" className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-heading text-3xl text-text mb-6">Method and Limits</h2>
        <div className="text-text-secondary space-y-4 font-body leading-relaxed text-sm md:text-base">
          <p>
            <span className="font-mono bg-surface-2 px-1 rounded text-text">NDVI = (NIR - Red) / (NIR + Red)</span>. Change is the difference between two periods.
          </p>
          <p>
            <strong>Limitations:</strong> cloud cover, area size, imagery resolution. Results are indicators, not ground truth.
          </p>
          <p className="text-xs text-text-muted mt-8 border-t border-border pt-8">
            Data sources: Sentinel-2, MapTiler, OpenStreetMap, UNEP-WCMC protected areas.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-bg py-12 px-6 flex flex-col items-center gap-8">
        <button onClick={() => navigate('/signup')} className="btn-primary px-8 py-3 text-lg">Start exploring</button>
        <div className="text-center text-xs text-text-muted space-y-2">
          <p>Attributions: Leaflet, MapTiler, OpenStreetMap contributors, UNEP-WCMC, Copernicus Sentinel data.</p>
          <p>Photo credits: Unsplash.</p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
