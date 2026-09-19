import React from 'react';
import { GPSLocation } from '../lib/location';
import { MapPin, Navigation, Compass, ExternalLink, Copy, Check, RefreshCw, ShieldAlert, Globe } from 'lucide-react';
import { soundFX } from '../lib/audio';

interface LocationRadarCardProps {
  location: GPSLocation;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const LocationRadarCard: React.FC<LocationRadarCardProps> = ({
  location,
  onRefresh,
  isRefreshing = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyCoordinates = () => {
    soundFX.playConfirm();
    navigator.clipboard.writeText(`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  const embedMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01}%2C${location.latitude - 0.01}%2C${location.longitude + 0.01}%2C${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`;

  return (
    <div className="w-full bg-slate-950/90 border border-cyan-500/40 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.15)] font-mono text-xs my-2">
      {/* Top Header */}
      <div className="px-3 py-2 bg-gradient-to-r from-cyan-950/90 via-slate-950 to-slate-950 border-b border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-300 font-bold">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute" />
            <MapPin className="w-4 h-4 text-cyan-400 z-10" />
          </div>
          <span className="uppercase tracking-wider">J.A.R.V.I.S. GPS LIVE RADAR</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 rounded bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 transition"
            title="Refresh Live Satellite GPS Fix"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        )}
      </div>

      {/* Embedded Tactical Map View */}
      <div className="relative w-full h-40 bg-slate-900 overflow-hidden border-b border-cyan-900/40">
        <iframe
          title="Tactical Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={embedMapUrl}
          className="opacity-80 contrast-125 saturate-150 filter"
        />
        {/* Futuristic Map Overlay Frame */}
        <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/20 rounded-none bg-gradient-to-b from-transparent via-cyan-950/10 to-slate-950/80 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border border-cyan-400/60 animate-ping absolute" />
          <div className="w-6 h-6 rounded-full border-2 border-cyan-400 bg-cyan-500/30 backdrop-blur-xs flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.8)]">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>

        {/* Live Accuracy Tag on Map */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-cyan-500/40 text-[10px] text-cyan-300 backdrop-blur-md flex items-center gap-1">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span>Accuracy ±{location.accuracy}m</span>
        </div>
      </div>

      {/* Address & Coordinates Details */}
      <div className="p-3 space-y-2.5">
        {location.address && (
          <div className="flex items-start gap-2 text-slate-200">
            <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs leading-snug font-sans">{location.address}</p>
          </div>
        )}

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">LATITUDE</span>
            <span className="text-cyan-300 font-bold">{location.latitude.toFixed(6)}° N</span>
          </div>

          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">LONGITUDE</span>
            <span className="text-cyan-300 font-bold">{location.longitude.toFixed(6)}° E</span>
          </div>

          {location.altitude != null && (
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block">ALTITUDE</span>
              <span className="text-slate-200 font-bold">{location.altitude} meters</span>
            </div>
          )}

          {location.speed != null && (
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block">VELOCITY</span>
              <span className="text-slate-200 font-bold">{location.speed} km/h</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={copyCoordinates}
            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 transition flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY COORDS'}</span>
          </button>

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundFX.playConfirm()}
            className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>OPEN MAPS</span>
          </a>
        </div>
      </div>
    </div>
  );
};
