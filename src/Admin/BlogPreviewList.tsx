import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { BLOG_CATEGORIES } from "../types/blog";
import { Pencil, Trash2, BookOpen, Github, Youtube, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { submitContentChange } from "../lib/cms-service";

interface BlogPreviewListProps {
  onEdit: (blog: any) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  blog: "bg-orange-100 text-orange-700",
  research: "bg-purple-100 text-purple-700",
  article: "bg-blue-100 text-blue-700",
  project: "bg-green-100 text-green-700",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  approved: "bg-green-100 text-green-700 border border-green-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
};

const BlogPreviewList: React.FC<BlogPreviewListProps> = ({ onEdit, setSuccess, setError }) => {
  const { userData, isWebmaster } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (blog: any) => {
    if (!userData) return;
    if (!window.confirm(`Delete "${blog.title}"?`)) return;
    try {
      await submitContentChange(
        userData.uid,
        userData.name || "Unknown",
        "blogs",
        blog,
        blog.id,
        userData.email,
        userData.role,
        'delete'
      );
      setSuccess(isWebmaster ? "Blog deleted!" : "Deletion request sent!");
    } catch (err: any) {
      setError("Delete failed: " + err.message);
    }
  };

  useEffect(() => {
    // ── Reverted to legacy collection: blogs ──
    const q = query(
      collection(db, "blogs"), 
      orderBy("created_at", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setBlogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError("CMS Sync Error: " + err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const getCategoryLabel = (cat: string) => {
    return BLOG_CATEGORIES.find((c) => c.value === cat)?.label ?? cat ?? "Article";
  };

  const formatDate = (ts: any) => {
    if (!ts) return "â€”";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
        <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No blogs yet</p>
        <p className="text-sm text-gray-400 mt-1">Click "Add New Blog" to create the first one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blogs.map((blog) => {
        const author = blog.author || { name: blog.author_name || "Unknown", image: "" };
        const category = blog.category || "blog";
        const imageCount = (blog.images || []).filter((i: string) => i.trim()).length;
        const githubCount = (blog.githubLinks || []).filter((i: string) => i.trim()).length;
        const youtubeCount = (blog.youtubeLinks || []).filter((i: string) => i.trim()).length;
        // Backward compaatibility: if no status, assume approved
        const status = blog.status || "approved";

        return (
          <div
            key={blog.id}
            className="flex gap-4 items-start p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow"
          >
            {/* Image preview */}
            <div className="flex-shrink-0 w-20 h-20 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
              {blog.images?.[0] ? (
                <img
                  src={blog.images[0]}
                  alt={blog.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <BookOpen className="h-6 w-6 text-gray-300" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category] || "bg-gray-100 text-gray-600"}`}>
                  {getCategoryLabel(category)}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                  {status}
                </span>
                <span className="text-xs text-gray-400">{formatDate(blog.created_at)}</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm truncate">{blog.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                By {author.name}
              </p>
              {/* Meta badges */}
              <div className="flex gap-3 mt-2">
                {imageCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <ImageIcon className="h-3 w-3" /> {imageCount}
                  </span>
                )}
                {githubCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Github className="h-3 w-3" /> {githubCount}
                  </span>
                )}
                {youtubeCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Youtube className="h-3 w-3" /> {youtubeCount}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 flex-shrink-0 items-end">
              <div className="flex gap-1 mt-auto">
                <button
                  onClick={() => onEdit(blog)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(blog)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BlogPreviewList;
