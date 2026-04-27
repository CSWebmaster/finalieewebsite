import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import VerificationForm from '@/components/certificate/VerificationForm';
import ResultCard from '@/components/certificate/ResultCard';
import { motion, AnimatePresence } from 'framer-motion';

const CertificateVerification = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleVerify = async (certificate_id: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificate_id, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('An error occurred during verification. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <PageLayout showFooter>
      <div className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-20 overflow-hidden">
        {/* Background Image with parallax */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://ieee.socet.edu.in/wp-content/uploads/2021/01/cropped-SOU-IEEE-SB-Header.png)",
            transform: `scale(1.12) translateY(${scrollY * 0.25}px)`,
            transition: "transform 0.05s linear",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 z-0 bg-slate-900/60 backdrop-blur-[4px]" />

        <div className="container relative z-10 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
          <AnimatePresence mode="wait">
            {!result && !error ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <div className="text-center mb-12 drop-shadow-sm">
                  <div className="inline-block px-4 py-1.5 bg-blue-600/20 rounded-full border border-blue-400/30 mb-6 backdrop-blur-md">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-200">Official Record System</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 uppercase drop-shadow-2xl">
                    Verify <span className="text-blue-400">Authenticity</span>
                  </h1>
                  <div className="w-20 h-1.5 bg-blue-500 mx-auto mb-6 rounded-full shadow-lg opacity-60"></div>
                  <p className="text-xs md:text-sm font-bold text-blue-100/80 uppercase tracking-[0.3em] leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                    Validation Portal for IEEE SOU SB Organised Events & Credentials
                  </p>
                </div>

                <VerificationForm onVerify={handleVerify} loading={loading} />
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <ResultCard result={result} error={error} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
};

export default CertificateVerification;
