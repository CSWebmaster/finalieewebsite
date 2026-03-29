import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Loader from "@/components/Loader";
import AIAssistant from "@/components/AIAssistant";
import { Button } from "@/components/ui/button";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const Events = lazy(() => import("./pages/Events"));
const Achievement = lazy(() => import("./pages/Achievement"));
const BranchAwards = lazy(() => import("./pages/BranchAwards"));
const Newsletter = lazy(() => import("./pages/Newsletter"));
const StudentAchievements = lazy(() => import("./pages/StudentAchievements"));
const UpcomingEvents = lazy(() => import("./pages/UpcomingEvents"));
const Contact = lazy(() => import("./pages/Contact"));
const Join = lazy(() => import("./pages/Join"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const BlogList = lazy(() => import("./pages/blogs/BlogList"));
const BlogDetail = lazy(() => import("./pages/blogs/BlogDetail"));
const WriteBlog = lazy(() => import("./pages/blogs/WriteBlog"));

// SIGs Pages
const SIGs = lazy(() => import("./pages/SIGs"));
const SIGDetails = lazy(() => import("./pages/SIGDetails"));

// About Pages
const IEEE = lazy(() => import("./pages/about/IEEE"));
const IEEESOUSSB = lazy(() => import("./pages/about/IEEESOUSSB"));
const IEEEOUSSBWIE = lazy(() => import("./pages/about/IEEEOUSSBWIE"));
const IEEESOUSPSSBC = lazy(() => import("./pages/about/IEEESOUSPSSBC"));
const IEEESOUSCSSBC = lazy(() => import("./pages/about/IEEESOUSCSSBC"));
const IEEESOUSSIGHTSBG = lazy(() => import("./pages/about/IEEESOUSSIGHTSBG"));
const IEEESOUSSBJRNY = lazy(() => import("./pages/about/IEEESOUSSBJRNY"));
const IEEESOUSSBJRNYLoop = lazy(() => import("./pages/about/IEEESOUSSBJRNYLoop"));
const JourneyDetails = lazy(() => import("./pages/about/JourneyDetails"));

// Team Pages
const TeamFaculty = lazy(() => import("./pages/team/TeamFaculty"));
const TeamAdvisory = lazy(() => import("./pages/team/TeamAdvisory"));
const TeamExecutive = lazy(() => import("./pages/team/TeamExecutive"));
const TeamCore = lazy(() => import("./pages/team/TeamCore"));
const TeamMembers = lazy(() => import("./pages/team/TeamMembers"));

// Admin + Auth
const Admin = lazy(() => import("./pages/Admin"));
const Authentication = lazy(() => import("./components/Authentication"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// Details Pages
const EventDetails = lazy(() => import("./pages/EventDetails"));
const AwardDetails = lazy(() => import("./pages/AwardDetails"));
const MemberDetails = lazy(() => import("./pages/MemberDetails"));
const Bylaws = lazy(() => import("./pages/Bylaws"));
const FAQ = lazy(() => import("./pages/FAQ"));

import ScrollProgressBar from "@/components/ScrollProgressBar";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

const queryClient = new QueryClient();

// Suppress React Router warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Simple Error Boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4 text-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
            <p className="mb-4">Please try refreshing the page.</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setLoading(false);
    };

    if (document.readyState === "complete") {
      setLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
      // Hard cap — don't show loader forever if something hangs (3s as in original InitialLoader)
      const timer = setTimeout(handleLoad, 3000);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(timer);
      };
    }
  }, []);

  if (loading) return <Loader />;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <ScrollRevealProvider />
              <ScrollProgressBar />
              <AIAssistant />
              <Suspense fallback={<Loader />}>
                <Routes>
                  {/* Main Pages */}
                  <Route path="/" element={<Index />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/achievement" element={<Achievement />} />
                  <Route path="/achievement/branch-awards" element={<BranchAwards />} />
                  <Route path="/achievement/newsletter" element={<Newsletter />} />
                  <Route path="/achievement/student" element={<StudentAchievements />} />
                  <Route path="/achievement/upcoming-events" element={<UpcomingEvents />} />
                  <Route path="/achievements" element={<Navigate to="/achievement" replace />} />
                  <Route path="/awards" element={<Navigate to="/achievement" replace />} />
                  <Route path="/bylaws" element={<Bylaws />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/join" element={<Join />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/blogs" element={<BlogList />} />
                  <Route path="/blogs/category/:category" element={<BlogList />} />
                  <Route path="/blogs/:id" element={<BlogDetail />} />
                  <Route path="/write-blog" element={<WriteBlog />} />

                  {/* SIGs Pages */}
                  <Route path="/sigs" element={<SIGs />} />
                  <Route path="/sigs/:id" element={<SIGDetails />} />

                  {/* About Pages */}
                  <Route path="/about/ieee" element={<IEEE />} />
                  <Route path="/about/ieee-sou-sb" element={<IEEESOUSSB />} />
                  <Route path="/about/ieee-sou-wie-sb-ag" element={<IEEEOUSSBWIE />} />
                  <Route path="/about/ieee-sou-sb-journey" element={<IEEESOUSSBJRNY />} />
                  <Route path="/about/ieee-sou-sb-journey-loop" element={<IEEESOUSSBJRNYLoop />} />
                  <Route path="/about/ieee-sou-sb-journey-loop/:id" element={<JourneyDetails />} />
                  <Route path="/about/ieee-sou-sps-sbc" element={<IEEESOUSPSSBC />} />
                  <Route path="/about/ieee-sou-cs-sbc" element={<IEEESOUSCSSBC />} />
                  <Route path="/about/ieee-sou-sight-sbg" element={<IEEESOUSSIGHTSBG />} />

                  {/* Team Pages */}
                  <Route path="/team/faculty-advisor" element={<TeamFaculty />} />
                  <Route path="/team/advisory-board" element={<TeamAdvisory />} />
                  <Route path="/team/executive-members" element={<TeamExecutive />} />
                  <Route path="/team/core-members" element={<TeamCore />} />
                  <Route path="/team/members" element={<TeamMembers />} />

                  {/* Auth & Admin Panel - Hidden Route (Only accessible via direct URL) */}
                  <Route path="/authentication" element={<Authentication />} />
                  <Route
                    path="/ieee-admin-portal-sou-2025"
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />

                  {/* Details Pages */}
                  <Route path="/eventdetails/:id" element={<EventDetails />} />
                  <Route path="/awarddetails/:id" element={<AwardDetails />} />
                  <Route path="/memberdetails/:id" element={<MemberDetails />} />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
