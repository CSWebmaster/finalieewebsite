import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Target, Lightbulb, Heart, Coins, Brain, Code, Mic, Book, Zap, TrendingUp, Puzzle, Rocket, Users2, GraduationCap, Award } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function SIGDetails() {
  const { id } = useParams<{ id: string }>();
  
  const [firebaseSig, setFirebaseSig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchSig = async () => {
        try {
          const docRef = doc(db, "sigs", id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setFirebaseSig({
              id: snap.id,
              title: data.title || "Unknown SIG",
              description: data.details || data.description || "No description provided.",
              logoUrl: data.logoUrl || "",
              icon: Users,
              themeColor: data.themeColor || "#3b82f6",
              mission: data.mission,
              activities: Array.isArray(data.activities) ? data.activities : [],
              benefits: Array.isArray(data.benefits) ? data.benefits : [],
              quote: data.quote,
              focusArea: data.focusArea,
              meetingFrequency: data.meetingFrequency,
              openTo: data.openTo
            });
          }
        } catch (error) {
          console.error("Error fetching SIG details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSig();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sig = firebaseSig;

  if (!sig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">SIG Not Found</h1>
          <p className="text-muted-foreground mt-2">The SIG you're looking for doesn't exist.</p>
          <Link to="/sigs" className="text-primary hover:underline mt-4 inline-block">
            ← Back to SIGs
          </Link>
        </div>
      </div>
    );
  }

  const Icon = sig.icon || Users;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-15" 
          style={{ background: `radial-gradient(circle at top center, ${sig.themeColor} 0%, transparent 70%)` }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Link 
              to="/sigs" 
              className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to SIGs
            </Link>
            
            <div className="flex justify-center mb-6">
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg overflow-hidden"
                style={{ backgroundColor: sig.themeColor }}
              >
                {sig.logoUrl ? (
                  <img src={sig.logoUrl} alt={`${sig.title} Logo`} className="w-16 h-16 object-contain drop-shadow-md" />
                ) : (
                  <Icon className="w-10 h-10" />
                )}
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              {sig.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {sig.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Mission */}
              {sig.mission && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border/50"
                >
                  <div className="flex items-center mb-4">
                    <Target className="w-6 h-6 mr-3" style={{ color: sig.themeColor }} />
                    <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {sig.mission}
                  </p>
                </motion.div>
              )}

              {/* Activities */}
              {sig.activities?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border/50"
                >
                  <div className="flex items-center mb-6">
                    <Calendar className="w-6 h-6 mr-3" style={{ color: sig.themeColor }} />
                    <h2 className="text-2xl font-bold text-foreground">Activities</h2>
                  </div>
                  <ul className="space-y-3">
                    {sig.activities.map((activity: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                        className="flex items-start text-muted-foreground"
                      >
                        <div className="w-2 h-2 rounded-full mr-3 shrink-0 mt-2" style={{ backgroundColor: sig.themeColor }} />
                        <span>{activity}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Benefits */}
              {sig.benefits?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border/50"
                >
                  <div className="flex items-center mb-6">
                    <Users className="w-6 h-6 mr-3" style={{ color: sig.themeColor }} />
                    <h2 className="text-2xl font-bold text-foreground">Benefits</h2>
                  </div>
                  <ul className="space-y-3">
                    {sig.benefits.map((benefit: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                        className="flex items-start text-muted-foreground"
                      >
                        <div className="w-2 h-2 rounded-full mr-3 shrink-0 mt-2" style={{ backgroundColor: sig.themeColor }} />
                        <span>{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-8">
              {/* Quote */}
              {sig.quote && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="rounded-2xl p-8 border"
                  style={{ 
                    backgroundImage: `linear-gradient(to bottom right, ${sig.themeColor}15, transparent)`, 
                    borderColor: `${sig.themeColor}30` 
                  } as React.CSSProperties}
                >
                  <div className="flex items-center mb-4">
                    <Lightbulb className="w-6 h-6 mr-3" style={{ color: sig.themeColor }} />
                    <h3 className="text-lg font-semibold text-foreground">Inspiration</h3>
                  </div>
                  <blockquote className="text-muted-foreground italic leading-relaxed">
                    "{sig.quote}"
                  </blockquote>
                </motion.div>
              )}

              {/* Quick Stats */}
              {(sig.focusArea || sig.meetingFrequency || sig.openTo) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
                >
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">Quick Info</h3>
                  <div className="flex flex-col gap-3">
                    {sig.focusArea && (
                      <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/40 border border-border/30">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focus Area</span>
                        <span className="font-semibold text-foreground text-sm leading-snug">{sig.focusArea}</span>
                      </div>
                    )}
                    {sig.meetingFrequency && (
                      <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/40 border border-border/30">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meeting Frequency</span>
                        <span className="font-semibold text-foreground text-sm">{sig.meetingFrequency}</span>
                      </div>
                    )}
                    {sig.openTo && (
                      <div 
                        className="flex flex-col gap-1 p-4 rounded-xl border"
                        style={{ backgroundColor: `${sig.themeColor}10`, borderColor: `${sig.themeColor}30` }}
                      >
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open To</span>
                        <span className="font-semibold text-sm" style={{ color: sig.themeColor }}>{sig.openTo}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Join CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="rounded-2xl p-8 text-center border"
                style={{ 
                  backgroundImage: `linear-gradient(to bottom right, ${sig.themeColor}15, transparent, ${sig.themeColor}10)`,
                  borderColor: `${sig.themeColor}20`
                } as React.CSSProperties}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Ready to Join?</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  Become part of our growing community and start your journey with {sig.title}.
                </p>
                <Link
                  to="/join"
                  className="inline-flex items-center px-6 py-3 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:opacity-90"
                  style={{ backgroundColor: sig.themeColor }}
                >
                  Join IEEE SOU SB
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}