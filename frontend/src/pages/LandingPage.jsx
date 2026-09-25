import React from 'react';
import { Link } from 'react-router-dom';
import MaskedHeading from '../components/MaskedHeading';
import DepthCarousel from '../components/DepthCarousel';
import AnimatedList from '../components/AnimatedList';

const carouselItems = [
  { image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=800', alt: 'Tiger' },
  { image: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=800', alt: 'Dark Forest' },
  { image: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=800', alt: 'Leopard' },
  { image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?q=80&w=800', alt: 'Sea Turtle' },
  { image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=800', alt: 'Elephant' }
];

const featuresList = [
  'Live Sentinel-2 Satellites',
  'AI Environmental Insights',
  'Deforestation Alerts',
  'Protected Sanctuaries Tracking',
  'Global Water Change Analytics',
  'Automated Hotspot Detection',
  'Historical Ecosystem Data'
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-slate-200 overflow-x-hidden font-sans relative">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1715] via-[#0a0f0d] to-[#060908] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <h1 className="font-heading font-bold text-2xl tracking-wider uppercase text-slate-100">WILD<span className="text-[#F4C430]">LIFE</span></h1>
        <div className="flex gap-4">
          <Link to="/login" className="text-slate-300 hover:text-white font-medium px-4 py-2 transition-colors">Sign In</Link>
          <Link to="/signup" className="btn-primary px-6 py-2 rounded-full shadow-lg shadow-black/20 hover:shadow-[#F4C430]/20 text-sm">Get Started</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col gap-24">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
          <div className="w-full max-w-5xl">
            <MaskedHeading 
              text="MONITOR THE WILD"
              src="https://images.unsplash.com/photo-1518413203875-92520a061405?q=80&w=2000"
              mediaType="image"
              parallax={40}
              reveal="wipe"
              duration={1.5}
              textScale={0.15}
            />
          </div>
          <p className="text-xl text-[#94A8A0] max-w-2xl font-light leading-relaxed mt-4">
            Harness the power of AI and live Copernicus satellite imagery to track deforestation, preserve water bodies, and protect global wildlife habitats.
          </p>
          <Link to="/signup" className="mt-8 btn-primary px-10 py-4 rounded-full text-lg tracking-widest shadow-xl shadow-[#F4C430]/10 hover:shadow-[#F4C430]/30 transition-all hover:-translate-y-1">
            START EXPLORING
          </Link>
        </section>

        {/* Showcase Section with Carousel & Animated List */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh] pb-24">
          
          {/* Left Side: Animated Features */}
          <div className="flex flex-col gap-8 order-2 lg:order-1">
            <div>
              <h2 className="font-heading font-bold text-3xl text-white mb-2 uppercase tracking-wide">
                Advanced <span className="text-[#F4C430]">Capabilities</span>
              </h2>
              <p className="text-[#94A8A0] font-light">
                Our platform combines cutting edge geospatial analysis with artificial intelligence.
              </p>
            </div>
            
            <div className="h-[400px]">
              <AnimatedList 
                items={featuresList} 
                showGradients={true} 
                className="w-full max-w-md"
              />
            </div>
          </div>

          {/* Right Side: Depth Carousel */}
          <div className="order-1 lg:order-2 h-[500px] relative w-full rounded-3xl overflow-hidden glass-panel border border-white/5">
            <DepthCarousel 
              items={carouselItems}
              depth={200}
              spread={110}
              tilt={15}
              visibleCards={4}
              autoplay={true}
              autoplayDelay={3000}
            />
          </div>

        </section>

      </main>
    </div>
  );
}

export default LandingPage;
