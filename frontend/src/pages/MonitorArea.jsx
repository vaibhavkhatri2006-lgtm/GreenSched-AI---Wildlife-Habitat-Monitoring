import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, WMSTileLayer } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

function MapEvents({ onMapClick }) {
 useMapEvents({
 click(e) {
 onMapClick(e.latlng);
 }
 });
 return null;
}

export default function MonitorArea() {
 const [areaName, setAreaName] = useState('');
 const [centerCoord, setCenterCoord] = useState(null);
 const [polygonCoords, setPolygonCoords] = useState([]);
 const [loading, setLoading] = useState(false);
 const [status, setStatus] = useState('');
 const [showSanctuaries, setShowSanctuaries] = useState(true);

 // Generate a mock square AOI around the clicked point and fetch location name
 const handleMapClick = async (latlng) => {
 setCenterCoord(latlng);
 const d = 0.05; // rough size ~ 5km
 const coords = [
 [latlng.lat - d, latlng.lng - d],
 [latlng.lat + d, latlng.lng - d],
 [latlng.lat + d, latlng.lng + d],
 [latlng.lat - d, latlng.lng + d],
 ];
 setPolygonCoords(coords);

 // Reverse geocode to get location name automatically
 try {
 setAreaName('Detecting location...');
 const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
 if (res.data && res.data.address) {
 const addr = res.data.address;
 const place = addr.city || addr.town || addr.village || addr.county || addr.state || 'Unknown Area';
 const country = addr.country || '';
 setAreaName(`${place}${country ? `, ${country}` : ''} Zone`);
 } else {
 setAreaName(`Area at ${latlng.lat.toFixed(2)}, ${latlng.lng.toFixed(2)}`);
 }
 } catch (err) {
 console.error('Geocoding failed:', err);
 setAreaName(`Area at ${latlng.lat.toFixed(2)}, ${latlng.lng.toFixed(2)}`);
 }
 };

 const handleSave = async () => {
 if (!areaName || polygonCoords.length === 0) {
 alert("Please provide an area name and click the map to select an area.");
 return;
 }
 setLoading(true);
 setStatus('Saving...');
 
 // Create GeoJSON Polygon
 const geoJson = {
 type:"Polygon",
 coordinates: [[
 [polygonCoords[0][1], polygonCoords[0][0]],
 [polygonCoords[1][1], polygonCoords[1][0]],
 [polygonCoords[2][1], polygonCoords[2][0]],
 [polygonCoords[3][1], polygonCoords[3][0]],
 [polygonCoords[0][1], polygonCoords[0][0]] // close ring
 ]]
 };

 try {
 await axios.post(`${import.meta.env.VITE_API_BASE_URL}/areas/`, {
 name: areaName,
 description:"Created from Dashboard",
 geojson: geoJson,
 latitude: centerCoord.lat,
 longitude: centerCoord.lng,
 area_km2: 25 // approximate 5x5 km
 });
 setStatus('Area Saved Successfully!');
 setTimeout(() => setStatus(''), 3000);
 } catch (err) {
 const errorMsg = err.response?.data?.detail || err.message || 'Failed to save area.';
 setStatus(`Error: ${Array.isArray(errorMsg) ? JSON.stringify(errorMsg[0].loc) + ' ' + errorMsg[0].msg : errorMsg}`);
 console.error(err);
 }
 setLoading(false);
 };

 return (
 <div className="flex h-full gap-6 max-w-7xl mx-auto">
 {/* Sidebar Controls */}
 <div className="w-80 flex flex-col gap-4">
 <div className="glass-panel p-5 rounded-xl border border-successorder">
 <h2 className="font-heading font-semibold text-2xl text-accent mb-4 tracking-wider">Define Monitoring Area</h2>
 
 <div className="space-y-4">
 <div>
 <label className="block text-xs text-text-secondary mb-1">Area Name</label>
 <input 
 type="text" 
 className="w-full bg-successg border border-successorder rounded-md px-3 py-3 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-[#F4C430]/50 transition-all"
 placeholder="e.g. Amazon Zone A"
 value={areaName}
 onChange={(e) => setAreaName(e.target.value)}
 />
 </div>
 
 <div className="pt-2 border-t border-successorder">
 <p className="text-xs text-text-secondary mb-3">
 1. Click anywhere on the map to define the center of your 5x5km Area of Interest (AOI).
 <br/>
 2. Enter a name and save.
 </p>
 
 <button 
 onClick={handleSave} 
 disabled={loading || polygonCoords.length === 0 || !areaName}
 className="w-full btn-primary py-3 rounded-lg mt-4 shadow-lg shadow-black/20"
 >
 {loading ? 'Saving...' : 'Save Monitoring Area'}
 </button>
 {status && <p className="text-xs mt-3 text-center text-text-secondary font-medium">{status}</p>}
 </div>
 </div>
 </div>
 </div>

 {/* Map */}
 <div className="flex-1 glass-panel rounded-xl border border-successorder overflow-hidden relative">
 <div className="absolute top-4 left-4 z-[1000] bg-successg/90 backdrop-blur px-4 py-3 rounded-lg border border-successorder shadow-lg">
 <h3 className="font-semibold text-sm mb-2 text-text">Map Layers</h3>
 <div className="space-y-2 text-xs">
 <label className="flex items-center gap-2 text-text-secondary">
 <input type="checkbox" checked={showSanctuaries} onChange={(e) => setShowSanctuaries(e.target.checked)} className="accent-[#F4C430]" /> Protected Forests & Sanctuaries (Green)
 </label>
 </div>
 </div>
 <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-successg/90 backdrop-blur-md px-4 py-2 rounded-full border border-accent/20 shadow-lg flex items-center gap-3">
 <span className="text-xs font-medium text-accent">Click Map to Generate AOI</span>
 </div>
 <div className="absolute bottom-4 right-4 z-[1000] bg-successg/90 backdrop-blur px-4 py-3 rounded-lg border border-successorder shadow-lg">
 <h3 className="font-semibold text-sm mb-2 text-text">Map Legend</h3>
 <div className="space-y-2 text-xs">
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-sm bg-[#10b981] opacity-60"></span>
 <span className="text-text-secondary">Protected Sanctuaries / Forests</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-sm bg-[#10b981] border border-[#10b981]"></span>
 <span className="text-text-secondary">Selected Area of Interest</span>
 </div>
 </div>
 </div>
 <MapContainer center={[-2.3333, 34.8333]} zoom={5} className="h-full w-full bg-successg z-0 cursor-crosshair">
 <TileLayer
 attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
 url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
 />
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
 <MapEvents onMapClick={handleMapClick} />
 {polygonCoords.length > 0 && (
 <Polygon positions={polygonCoords} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }} />
 )}
 </MapContainer>
 </div>
 </div>
 );
}
