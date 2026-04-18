import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { Search, BookOpen, Calendar, Github, Youtube, Image as ImageIcon, PenSquare } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BLOG_CATEGORIES, BlogCategory } from "@/types/blog";
import { useLatencyTracker } from "@/hooks/useLatencyTracker";
import { useSmartLoader } from "@/hooks/useSmartLoader";
import { SmartLoader } from "@/components/performance/SmartLoader";
import { LazyImage } from "@/components/performance/LazyImage";

const CATEGORY_COLORS: Record<string, string> = {
  blog: "bg-orange-100 text-orange-700 border-orange-200",
  article: "bg-blue-100 text-blue-700 border-blue-200",
};

const CATEGORY_LABELS: Record<string, string> = {
  blog: "Blog",
  article: "Article",
};

interface Blog {
  id: string;
  title: string;
  description?: string;
  content?: string;
  category?: BlogCategory;
  author?: { name: string; image: string };
  author_name?: string;
  images?: string[];
  image?: string;
  githubLinks?: string[];
  youtubeLinks?: string[];
  status?: string;
  created_at: any;
}

export default function BlogList() {
  useLatencyTracker("BlogList");
  const { category } = useParams<{ category?: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { loaderType } = useSmartLoader(loading);
  const [activeCategory, setActiveCategory] = useState<string>(category || "all");

  useEffect(() => {
    setActiveCategory(category || "all");
  }, [category]);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const blogsRef = collection(db, "blogs");
        const q = query(blogsRef, orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);
        
        let data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Blog[];
        
        if (activeCategory && activeCategory !== "all") {
          data = data.filter(blog => blog.category === activeCategory);
        }

        const approvedData = data.filter(blog => !blog.status || blog.status === "approved");
        setBlogs(approvedData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [activeCategory]);

  const filteredBlogs = blogs.filter((blog) => {
    const authorName = blog.author?.name || blog.author_name || "";
    const desc = blog.description || blog.content || "";
    return (
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown Date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getFirstImage = (blog: Blog) => {
    if (blog.images?.length) return blog.images[0];
    return blog.image || "";
  };

  const getAuthorName = (blog: Blog) => blog.author?.name || blog.author_name || "Anonymous";

  const categoryLabel =
    activeCategory !== "all"
      ? BLOG_CATEGORIES.find((c) => c.value === activeCategory)?.label || "Blogs"
      : "All Blogs";

  return (
    <PageLayout showFooter>
      <main className="pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center pt-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#00629B] to-[#004f7c]">
              {categoryLabel}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Insights, research, and projects from our IEEE SOU SB community.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Link
              to="/blogs"
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeCategory === "all"
                  ? "bg-[#00629B] text-white border-[#00629B]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#00629B] hover:text-[#00629B]"
              }`}
            >
              All
            </Link>
            {BLOG_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                to={`/blogs/category/${cat.value}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  activeCategory === cat.value
                    ? "bg-[#00629B] text-white border-[#00629B]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#00629B] hover:text-[#00629B]"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Search + Count */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by title, author, or content..."
                className="pl-10 h-11 rounded-xl border-white/20 bg-white/5 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Link to="/write-blog">
                <Button className="bg-[#00629B] hover:bg-[#004f7c] text-white shadow-md">
                  <PenSquare className="w-4 h-4 mr-2" /> Write a Blog
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground hidden md:block border-l border-border pl-4">
                Showing <span className="font-semibold">{filteredBlogs.length}</span> {categoryLabel.toLowerCase()}
              </div>
            </div>
          </div>

          <SmartLoader type={loaderType} containerClassName="min-h-[400px]">
            {filteredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog) => {
                  const firstImage = getFirstImage(blog);
                  const authorName = getAuthorName(blog);
                  const description = blog.description || blog.content || "";
                  const cat = blog.category || "blog";

                  return (
                    <Link
                      key={blog.id}
                      to={`/blogs/${blog.id}`}
                      className="group flex flex-col bg-white dark:bg-[#111] rounded-2xl border border-border/40 overflow-hidden hover:shadow-xl hover:border-[#00629B]/30 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="w-full bg-muted/10 flex items-center justify-center overflow-hidden" style={{ height: '200px' }}>
                        {firstImage ? (
                          <LazyImage
                            src={firstImage}
                            alt={blog.title}
                            containerClassName="w-full h-full"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground/30 gap-2">
                            <BookOpen className="h-10 w-10" />
                            <span className="text-xs">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {CATEGORY_LABELS[cat] || cat}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(blog.created_at)}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold mb-2 group-hover:text-[#00629B] transition-colors line-clamp-2">
                          {blog.title}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                          {description.substring(0, 200)}...
                        </p>

                        <div className="pt-4 border-t border-border/40 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            {blog.author?.image ? (
                              <LazyImage
                                src={blog.author.image}
                                alt={authorName}
                                className="h-8 w-8 rounded-full object-cover border border-border"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00629B] to-[#00a3ff] flex items-center justify-center text-white text-xs font-bold">
                                {authorName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-medium">{authorName}</span>
                          </div>
                          <div className="text-[#00629B] group-hover:translate-x-1 transition-transform">
                            <BookOpen className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
                <h3 className="text-xl font-semibold text-muted-foreground">No blogs found</h3>
                <p className="text-muted-foreground mt-1">Try a different category or search term.</p>
              </div>
            )}
          </SmartLoader>
        </div>
      </main>
    </PageLayout>
  );
}
