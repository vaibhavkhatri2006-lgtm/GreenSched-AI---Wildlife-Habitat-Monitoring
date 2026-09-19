import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON, WMSTileLayer } from 'react-leaflet';
import { Brain, FileText, AlertTriangle, ArrowRight, Play, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export default function Analysis() {
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('id');
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  
  const [analysisData, setAnalysisData] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  // Map Layer States
  const [showSatellite, setShowSatellite] = useState(true);
  const [showSanctuaries, setShowSanctuaries] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);

  // New Analysis Params
  const [baselineStart, setBaselineStart] = useState('2026-04-01');
  const [baselineEnd, setBaselineEnd] = useState('2026-05-01');
  const [currentStart, setCurrentStart] = useState('2026-08-01');
  const [currentEnd, setCurrentEnd] = useState('2026-09-01');

  useEffect(() => {
    fetchAreas();
    if (analysisId) {
      loadAnalysis(analysisId);
    }
  }, [analysisId]);

  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/areas/`);
      setAreas(res.data);
      if (res.data.length > 0 && !selectedAreaId) {
        setSelectedAreaId(res.data[0].id);
      }
    } catch (e) { console.error(e); }
  };

  const loadAnalysis = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/analysis/${id}`);
      setAnalysisData(res.data.data);
      
      // Fetch AI insight
      setInsightLoading(true);
      const aiRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/ai/insight?analysis_id=${id}`);
      setAiInsight(aiRes.data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setInsightLoading(false);
  };

  const runAnalysis = async () => {
    if (!selectedAreaId) return;
    setStatus('Running Analysis...');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/analysis/${selectedAreaId}/run`, {
        baseline_start: baselineStart,
        baseline_end: baselineEnd,
        current_start: currentStart,
        current_end: currentEnd,
        cloud_cover: 20.0
      });
      setStatus('Complete!');
      loadAnalysis(res.data.data.id);
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.detail || e.message || 'Failed to run analysis.';
      setStatus(`Error: ${Array.isArray(errorMsg) ? JSON.stringify(errorMsg[0].loc) + ' ' + errorMsg[0].msg : errorMsg}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full gap-6 max-w-screen-2xl mx-auto">
      
      {/* LEFT: Controls & AI */}
      <div className="w-[400px] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        
        {/* Run Analysis Box */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <h2 className="font-heading font-semibold text-2xl text-[#F4C430] mb-4 tracking-wider uppercase">Run New Analysis</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Monitoring Area</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200"
                value={selectedAreaId} onChange={(e) => setSelectedAreaId(e.target.value)}
              >
                <option value="" disabled>
                  {areas.length === 0 ? "No areas saved. Go to Monitor Area first." : "Select an area..."}
                </option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Baseline Start</label>
                <input type="date" value={baselineStart} onChange={(e) => setBaselineStart(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Baseline End</label>
                <input type="date" value={baselineEnd} onChange={(e) => setBaselineEnd(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Current Start</label>
                <input type="date" value={currentStart} onChange={(e) => setCurrentStart(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Current End</label>
                <input type="date" value={currentEnd} onChange={(e) => setCurrentEnd(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-200" />
              </div>
            </div>

            <button 
              onClick={runAnalysis} disabled={loading}
              className="w-full mt-4 btn-primary py-3 rounded-lg flex justify-center items-center gap-2 shadow-lg shadow-black/20"
            >
              {loading ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
              {loading ? 'Processing...' : 'Start Analysis'}
            </button>
            {status && <p className="text-xs text-center text-slate-400">{status}</p>}
          </div>
        </div>

        {/* AI Insights Box */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 border-l-4 border-l-[#F4C430] shadow-xl">
          <h2 className="font-heading font-semibold text-xl text-[#F4C430] mb-6 flex items-center gap-3 uppercase tracking-wider">
            <Brain size={20} />
            AI Environmental Insight
          </h2>
          {insightLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="animate-spin text-[#F4C430]" />
            </div>
          ) : aiInsight ? (
            <div className="space-y-4 text-sm">
              <p className="text-slate-300 italic">"{aiInsight.summary}"</p>
              
              <div>
                <h4 className="font-semibold text-[#F4C430] text-sm uppercase tracking-widest mb-2">Key Findings</h4>
                <ul className="list-disc pl-4 text-slate-300 text-xs space-y-1">
                  {aiInsight.key_findings.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-amber-400 text-xs uppercase tracking-wider mb-1">Recommended Actions</h4>
                <ul className="list-disc pl-4 text-slate-300 text-xs space-y-1">
                  {aiInsight.recommended_actions.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>

              <div className="p-3 bg-slate-800/50 rounded text-xs text-slate-400">
                <span className="font-semibold block mb-1">Limitations:</span>
                {aiInsight.limitations.map((l, i) => <div key={i}>• {l}</div>)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 text-center py-6">Run or select an analysis to generate insights.</div>
          )}
        </div>

      </div>

      {/* RIGHT: Map & Stats */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Stats Row */}
        {analysisData && (
          <div className="grid grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">NDVI Change</div>
              <div className={`text-2xl font-bold ${analysisData.ndvi_change < 0 ? 'text-red-400' : 'text-[#F4C430]'}`}>
                {analysisData.ndvi_change > 0 ? '+' : ''}{(analysisData.ndvi_change*100).toFixed(2)}%
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">NDWI Change</div>
              <div className="text-2xl font-bold text-[#F4C430]">
                {analysisData.ndwi_change > 0 ? '+' : ''}{(analysisData.ndwi_change*100).toFixed(2)}%
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Urban Expansion</div>
              <div className={`text-xl font-bold ${analysisData.builtup_change_area_km2 > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                +{analysisData.builtup_change_area_km2?.toFixed(2)} km²
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-500/5">
              <div className="text-xs text-red-400 mb-1 font-bold">Hotspots Detected</div>
              <div className="text-xl font-bold text-red-400">{analysisData.hotspot_count}</div>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 glass-panel rounded-xl border border-slate-800 overflow-hidden relative min-h-[500px]">
          <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur px-4 py-3 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="font-semibold text-sm mb-2 text-white">Map Layers</h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={showSatellite} onChange={(e) => setShowSatellite(e.target.checked)} className="accent-[#F4C430]" /> Satellite Base
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={showSanctuaries} onChange={(e) => setShowSanctuaries(e.target.checked)} className="accent-[#F4C430]" /> Protected Forests & Sanctuaries
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={showHotspots} onChange={(e) => setShowHotspots(e.target.checked)} className="accent-red-500" /> Active Hotspots
              </label>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur px-4 py-3 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="font-semibold text-sm mb-2 text-white">Map Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 opacity-60"></span>
                <span className="text-slate-300">Protected Sanctuaries / Forests</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></span>
                <span className="text-slate-300">Vegetation Loss Hotspot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
                <span className="text-slate-300">Urban Expansion Hotspot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
                <span className="text-slate-300">Water Body Change Hotspot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
                <span className="text-slate-300">Unspecified Critical Hotspot</span>
              </div>
            </div>
          </div>

          <MapContainer center={[-2.3333, 34.8333]} zoom={5} className="h-full w-full bg-slate-900 z-0">
            {showSatellite && (
              <TileLayer
                attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
              />
            )}
            
            {showSanctuaries && (
              <WMSTileLayer
                url="https://ext-data.unep-wcmc.org/arcgis/services/protected_areas/WDPA/MapServer/WMSServer"
                layers="1,2"
                format="image/png"
                transparent={true}
                opacity={0.5}
                attribution="UNEP-WCMC Protected Areas"
              />
            )}

            {/* If we have hotspots in analysis data, plot them */}
            {showHotspots && analysisData?.hotspots?.map((h, i) => {
              // Determine color based on hotspot type
              let color = '#ef4444'; // default red
              if (h.type === 'VEGETATION_LOSS') color = '#f97316'; // orange
              if (h.type === 'URBAN_EXPANSION') color = '#a855f7'; // purple
              if (h.type === 'WATER_CHANGE') color = '#06b6d4'; // cyan

              return h.geometry && (
                <GeoJSON 
                  key={i} 
                  data={h.geometry} 
                  pathOptions={{ 
                    color: color, 
                    fillColor: color, 
                    fillOpacity: 0.4, 
                    className: 'hotspot-pulse' 
                  }} 
                />
              );
            })}
          </MapContainer>
        </div>
      </div>

    </div>
  );
}
