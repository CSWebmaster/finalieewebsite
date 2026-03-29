import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { ArrowLeft, User, Calendar, Clock, Share2, Github, Youtube, ChevronLeft, ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { BLOG_CATEGORIES } from "@/types/blog";

const CATEGORY_COLORS: Record<string, string> = {
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
  created_at: any;
}

/* ── Image Marquee Component ── */
function ImageMarquee({ images }: { images: string[] }) {
  const [paused, setPaused] = useState(false);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="w-full flex items-center justify-center bg-muted/10 rounded-xl overflow-hidden mb-8" style={{ maxHeight: '400px' }}>
        <img
          src={images[0]}
          alt="Blog cover"
          className="w-full h-full object-contain"
          style={{ maxHeight: '400px' }}
          loading="lazy"
        />
      </div>
    );
  }

  // Duplicate for seamless loop
  const doubled = [...images, ...images];

  return (
    <div
      className="overflow-hidden rounded-xl mb-8 bg-muted/10 border border-border/40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex gap-4 py-3 px-2"
        style={{
          animation: paused ? 'none' : 'marqueeScroll 20s linear infinite',
          width: 'max-content',
        }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center border border-border/30"
            style={{ width: '280px', height: '200px' }}
          >
            <img
              src={src}
              alt={`Image ${(i % images.length) + 1}`}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-muted-foreground pb-2">
        {images.length} images · {paused ? 'Paused' : 'Hover to pause'}
      </p>
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
          <header className="mb-8">
            {/* Category badge */}
            <span className={`inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${CATEGORY_COLORS[category] || "bg-gray-100 text-gray-600"}`}>
              {categoryLabel}
            </span>

            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
              {blog.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 py-5 border-y border-border/40">
              {/* Author */}
              <div className="flex items-center gap-3">
                {authorImage ? (
                  <img
                    src={authorImage}
                    alt={authorName}
                    className="h-10 w-10 rounded-full object-cover border border-border"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00629B] to-[#00a3ff] flex items-center justify-center text-white font-bold">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold">{authorName}</p>
                  <p className="text-xs text-muted-foreground">Author</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-l border-border/40 pl-4 h-8">
                <Calendar className="h-4 w-4" />
                {formatDate(blog.created_at)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-l border-border/40 pl-4 h-8">
                <Clock className="h-4 w-4" />
                {readTime} min read
              </div>
            </div>
          </header>

          {/* Image Marquee (full-width, no cropping) */}
          {images.length > 0 && <ImageMarquee images={images} />}

          {/* Content */}
          <div className="prose dark:prose-invert prose-blue max-w-none text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-12">
            {description}
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
