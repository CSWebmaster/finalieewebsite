import React, { useState, useEffect, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { ArrowLeft, User, Calendar, Clock, Share2, Github, Youtube, ChevronLeft, ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { BLOG_CATEGORIES } from "@/types/blog";

const CATEGORY_COLORS: Record<string, string> = {
  blog: "bg-orange-100 text-orange-700",
  research: "bg-purple-100 text-purple-700",
  article: "bg-blue-100 text-blue-700",
  project: "bg-green-100 text-green-700",
};

interface Blog {
  id: string;
  title: string;
  description?: string;
  content?: string;
  category?: string;
  author?: { name: string; image: string };
  author_name?: string;
  author_email?: string;
  images?: string[];
  image?: string;
  githubLinks?: string[];
  youtubeLinks?: string[];
  imagePositions?: number[];
  created_at: any;
}

function ImageMarquee({ images }: { images: string[] }) {
  const [paused, setPaused] = useState(false);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="w-full flex items-center justify-center bg-muted/10 rounded-3xl overflow-hidden mb-12 shadow-inner group" style={{ maxHeight: '500px' }}>
        <img
          src={images[0]}
          alt="Blog cover"
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          style={{ maxHeight: '500px' }}
          loading="lazy"
        />
      </div>
    );
  }

  const doubled = [...images, ...images];

  return (
    <div
      className="overflow-hidden rounded-3xl mb-12 bg-muted/5 border border-border/20 shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex gap-6 py-4 px-3"
        style={{
          animation: paused ? 'none' : 'marqueeScroll 30s linear infinite',
          width: 'max-content',
        }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center border border-border/10 shadow-lg"
            style={{ width: '320px', height: '220px' }}
          >
            <img
              src={src}
              alt={`Gallery image`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 pb-3 opacity-60">
        <div className="h-1 w-1 rounded-full bg-primary" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mr-1">
          {images.length} Images in Gallery
        </p>
        <div className="h-1 w-1 rounded-full bg-primary" />
      </div>
    </div>
  );
}

/* ── Smart Content Component ── */
function SmartContent({ text, images, imagePositions }: { text: string; images: string[]; imagePositions?: number[] }) {
  if (!text) return null;

  // Pattern for URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // We'll interleave images every 2 paragraphs if not specified
  let currentImgIdx = 1; // Start from second image if marquee used first

  return (
    <div className="space-y-8">
      {paragraphs.map((para, idx) => {
        // Detect links and wrap them
        const parts = para.split(urlRegex);
        
        const renderedPara = (
          <div 
            key={`p-${idx}`} 
            className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-[200ms] fill-mode-both"
            style={{ animationDelay: `${200 + (idx * 100)}ms` }}
          >
            <p className={`text-slate-700 dark:text-slate-300 text-lg md:text-xl leading-[1.85] font-normal tracking-tight 
              ${idx === 0 ? "first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:mt-1" : ""}`}>
              {parts.map((part, pIdx) => {
                if (part.match(urlRegex)) {
                  return (
                    <a 
                      key={pIdx} 
                      href={part} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-4 decoration-current/30 hover:decoration-current transition-all"
                    >
                      {part.replace(/^https?:\/\//, '').split('/')[0]}...
                    </a>
                  );
                }
                return part;
              })}
            </p>
          </div>
        );

        // Interleave Image Logic
        let shouldShowImage = false;
        if (imagePositions && imagePositions.length > 0) {
          // If positions are specified, show if current index matches a position
          // (index + 1 because users think in 1-based indices usually, but I'll stick to 0-based if they enter 0)
          shouldShowImage = imagePositions.includes(idx) && currentImgIdx < images.length;
        } else {
          // Fallback to auto-distribution
          shouldShowImage = idx > 0 && idx % 2 === 0 && currentImgIdx < images.length;
        }
        const InterleavedImg = shouldShowImage ? (
           <div key={`img-${idx}`} className="my-12 animate-in zoom-in-95 fade-in duration-1000">
             <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/5 group border border-border/10">
               <img 
                 src={images[currentImgIdx++]} 
                 alt="Article visual" 
                 className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                 <p className="text-white text-xs font-bold uppercase tracking-widest">Enhanced Insight</p>
               </div>
             </div>
           </div>
        ) : null;

        return (
          <Fragment key={idx}>
            {renderedPara}
            {InterleavedImg}
          </Fragment>
        );
      })}
    </div>
  );
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        // ── Reverted to legacy collection: blogs ──
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() } as Blog);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex-grow flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-[#00629B] font-medium">Loading article...</div>
        </div>
      </PageLayout>
    );
  }

  if (!blog) {
    return (
      <PageLayout>
        <div className="flex-grow flex flex-col items-center justify-center p-4 min-h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">Blog not found</h2>
          <Button asChild><Link to="/blogs">Back to Blogs</Link></Button>
        </div>
      </PageLayout>
    );
  }

  const authorName = blog.author?.name || blog.author_name || "Anonymous";
  const authorImage = blog.author?.image || "";
  const description = blog.description || blog.content || "";
  const category = blog.category || "article";
  const categoryLabel = BLOG_CATEGORIES.find((c) => c.value === category)?.label || "Article";
  const images = (blog.images || (blog.image ? [blog.image] : [])).filter(Boolean);
  const githubLinks = (blog.githubLinks || []).filter(Boolean);
  const youtubeLinks = (blog.youtubeLinks || []).filter(Boolean);

  const wordCount = description.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Extract YouTube video ID for embed
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
    return match ? match[1] : null;
  };

  return (
    <PageLayout showFooter>
      <main className="pb-16 min-h-screen">
        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#00629B] mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blogs
          </Link>

          {/* Header */}
          <header className="mb-12 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            {/* Category badge */}
            <span className={`inline-block mb-6 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm ${CATEGORY_COLORS[category] || "bg-gray-100 text-gray-600"}`}>
              {categoryLabel}
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-10 leading-[1.15] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 max-w-4xl mx-auto">
              {blog.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-6 border-y border-border/40 w-full mb-8">
              {/* Author */}
              <div className="flex items-center gap-3">
                {authorImage ? (
                  <img
                    src={authorImage}
                    alt={authorName}
                    className="h-11 w-11 rounded-full object-cover border-2 border-[#00629B]/20 shadow-sm"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#00629B] to-[#00a3ff] flex items-center justify-center text-white font-bold shadow-md">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-bold leading-tight">{authorName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Author</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground sm:border-l border-border/40 sm:pl-8 h-8">
                <Calendar className="h-4 w-4 text-[#00629B]" />
                {formatDate(blog.created_at)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-l border-border/40 pl-8 h-8">
                <Clock className="h-4 w-4 text-[#00629B]" />
                {readTime} min read
              </div>
            </div>
          </header>

          {/* Image Marquee (full-width, no cropping) */}
          {images.length > 0 && <ImageMarquee images={images} />}

          <div className="max-w-4xl mx-auto mb-16 px-2">
            <div className="relative py-4">
              {/* Decorative accent */}
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent rounded-full hidden md:block"></div>
              
              <SmartContent text={description} images={images} imagePositions={blog.imagePositions} />
            </div>
          </div>

          {/* GitHub Links */}
          {githubLinks.length > 0 && (
            <div className="mb-8 p-5 rounded-xl border border-border/40 bg-muted/5">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                <Github className="h-5 w-5" /> GitHub Repositories
              </h3>
              <ul className="space-y-2">
                {githubLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00629B] hover:underline text-sm font-medium break-all"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* YouTube Embeds */}
          {youtubeLinks.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" /> Videos
              </h3>
              <div className="space-y-6">
                {youtubeLinks.map((link, i) => {
                  const videoId = getYoutubeId(link);
                  return videoId ? (
                    <div key={i} className="rounded-xl overflow-hidden border border-border/40 aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`Video ${i + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                       className="text-[#00629B] hover:underline text-sm block">
                      {link}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-8 pt-8 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-muted-foreground">Share this article:</p>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                  onClick={() => navigator.share?.({ title: blog.title, url: window.location.href })}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" asChild>
                <Link to="/blogs">Read More Articles</Link>
              </Button>
            </div>
          </footer>
        </article>
      </main>

      {/* Marquee animation */}
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </PageLayout>
  );
}
