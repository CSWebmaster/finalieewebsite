import React from 'react';
import { CheckCircle2, XCircle, Download, User, FileText, Info, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultCardProps {
  result: any;
  error: string | null;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, error, onReset }) => {
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto w-full"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-red-100 dark:border-red-900/30">
          <div className="bg-red-500/10 border-b border-red-500/20 p-8 flex flex-col items-center justify-center gap-4 text-red-600 dark:text-red-400">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <XCircle size={48} className="text-red-500" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Verification Failed</h2>
          </div>
          <div className="p-10 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-10 font-medium text-lg leading-relaxed max-w-md mx-auto">
              {error === 'Certificate not found or identity mismatch (check Name/Email).' 
                ? "No official record matches the provided Certificate ID and Identity. Please ensure your details are entered exactly as they appear on the document."
                : error}
            </p>
            <button 
              onClick={onReset}
              className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/20 hover:-translate-y-1"
            >
              Restart Verification
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const { data, fileUrl, source } = result;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto w-full"
    >
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800">
        <div className="bg-blue-600/5 border-b border-blue-600/10 p-8 flex flex-col items-center justify-center gap-4 text-blue-600 dark:text-blue-400">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Authentication Successful</h2>
        </div>
        
        <div className="p-10">
          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md text-blue-600 dark:text-blue-400">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Certificate ID</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{data['certificate_id'] || data['id']}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md text-blue-600 dark:text-blue-400">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Full Name / Identity</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{data['full name'] || data['name'] || data['email']}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md text-blue-600 dark:text-blue-400">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Event Category</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{data['type'] || data['event'] || 'Official Delegate'}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md text-blue-600 dark:text-blue-400">
                  <Info size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Database Source</p>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{source}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-10 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center md:text-left max-w-sm">
              * This credential has been digitally verified against the official IEEE SOU SB repository.
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button 
                onClick={onReset}
                className="flex-1 md:flex-none text-center px-8 py-4 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Done
              </button>
              {fileUrl && (
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none text-center px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex justify-center items-center gap-2"
                >
                  <Download size={20} /> View Certificate
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;
