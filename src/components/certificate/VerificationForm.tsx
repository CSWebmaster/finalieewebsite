import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, CreditCard, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerificationFormProps {
  onVerify: (certId: string, name: string) => void;
  loading: boolean;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ onVerify, loading }) => {
  const [certId, setCertId] = useState('');
  const [name, setName] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [actualCaptcha, setActualCaptcha] = useState('');
  const [bgLines, setBgLines] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    generateCaptcha();
    generateBgLines();
  }, []);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setActualCaptcha(result);
  };

  const generateBgLines = () => {
    const lines = [...Array(6)].map(() => ({
      x1: Math.random() * 100 + "%",
      y1: Math.random() * 100 + "%",
      x2: Math.random() * 100 + "%",
      y2: Math.random() * 100 + "%",
      rotate: Math.random() * 40 - 20,
      translateY: Math.random() * 10 - 5
    }));
    setBgLines(lines);
  };

  const handleRefresh = () => {
    generateCaptcha();
    generateBgLines();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== actualCaptcha) {
      alert('Invalid Security Code. Please try again.');
      generateCaptcha();
      generateBgLines();
      setCaptchaInput('');
      return;
    }

    onVerify(certId, name);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/20 dark:border-slate-800"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {/* Certificate ID */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-[0.2em]">Certificate ID</label>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="e.g. SOU-NX8F1B4"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-[0.2em]">Name or Email</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Exactly as in record"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Verification Code */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-[0.2em]">Security Code</label>
              <div className="flex gap-4 mb-3">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner h-16 select-none">
                  {/* SVG Noise & Lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                    <filter id="noise">
                      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                    {mounted && bgLines.map((line, i) => (
                      <line 
                        key={i}
                        x1={line.x1} 
                        y1={line.y1} 
                        x2={line.x2} 
                        y2={line.y2} 
                        stroke="currentColor" 
                        className="text-blue-900 dark:text-blue-400"
                        strokeWidth="1" 
                      />
                    ))}
                  </svg>
                  
                  {/* Distorted Text */}
                  <div className="flex gap-2 relative z-10">
                    {mounted && actualCaptcha.split('').map((char, i) => (
                      <span 
                        key={i} 
                        style={{ 
                          transform: `rotate(${bgLines[i]?.rotate || 0}deg) translateY(${bgLines[i]?.translateY || 0}px)`,
                          display: 'inline-block'
                        }}
                        className="text-2xl font-black text-blue-900 dark:text-blue-400 drop-shadow-md"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={handleRefresh} 
                  className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center h-16 w-16"
                >
                  <RefreshCw size={24} />
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Type code above"
                className="w-full px-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-bold text-center text-xl tracking-widest uppercase dark:text-white"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg flex justify-center items-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
            {loading ? 'Processing...' : 'Verify Authenticity'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerificationForm;
