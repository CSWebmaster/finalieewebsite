import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Blog, BlogCategory, BLOG_CATEGORIES } from "../types/blog";
import MultiImageInput from "./MultiImageInput";
import DynamicLinkInput from "./DynamicLinkInput";
import ImageUrlInput from "./ImageUrlInput";

const validateGithub = (link: string) => {
  const urlPattern = /^https?:\/\/(www\.)?github\.com\//i;
  if (!urlPattern.test(link)) return "Must be a valid GitHub URL";
  return null;
};

const validateYoutube = (link: string) => {
  const urlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i;
  if (!urlPattern.test(link)) return "Must be a valid YouTube URL";
  return null;
};

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog?: any;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

const cleanArray = (arr: string[]): string[] =>
  arr.map((s) => s.trim()).filter((s) => s !== "");

const BlogModal: React.FC<BlogModalProps> = ({
  isOpen,
  onClose,
  blog,
  setSuccess,
  setError,
}) => {
  const [loading, setLoading] = useState(false);

  // Static fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BlogCategory>("article");

  // Author
  const [authorName, setAuthorName] = useState("");
  const [authorImage, setAuthorImage] = useState("");

  // Dynamic arrays
  const [images, setImages] = useState<string[]>([""]);
  const [githubLinks, setGithubLinks] = useState<string[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title || "");
      setDescription(blog.description || blog.content || "");
      setCategory(blog.category || "article");
      setAuthorName(blog.author?.name || blog.author_name || "");
      setAuthorImage(blog.author?.image || "");
      setImages(blog.images?.length > 0 ? blog.images : [""]);
      setGithubLinks(blog.githubLinks || []);
      setYoutubeLinks(blog.youtubeLinks || []);
    } else {
      resetForm();
    }
  }, [blog]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("article");
    setAuthorName("");
    setAuthorImage("");
    setImages([""]);
    setGithubLinks([]);
    setYoutubeLinks([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !authorName.trim()) {
      setError("Title, description and author name are required.");
      return;
    }

    const cleanGithub = cleanArray(githubLinks);
    const cleanYoutube = cleanArray(youtubeLinks);

    const hasInvalidGithub = cleanGithub.some(link => validateGithub(link) !== null);
    const hasInvalidYoutube = cleanYoutube.some(link => validateYoutube(link) !== null);

    if (hasInvalidGithub || hasInvalidYoutube) {
      setError("Please ensure all GitHub and YouTube links are formatted correctly.");
      return;
    }

    setLoading(true);
    try {
      const blogData: Omit<Blog, "id"> = {
        title: title.trim(),
        description: description.trim(),
        category,
        author: {
          name: authorName.trim(),
          image: authorImage.trim(),
        },
        images: cleanArray(images),
        githubLinks: cleanGithub,
        youtubeLinks: cleanYoutube,
        status: blog?.status || "approved", // Admins actively approve their own blogs automatically
        updated_at: serverTimestamp(),
        ...(blog ? {} : { created_at: serverTimestamp() }),
      };

      if (blog?.id) {
        await updateDoc(doc(db, "blogs", blog.id), blogData as any);
        setSuccess("Blog updated successfully!");
      } else {
        await addDoc(collection(db, "blogs"), blogData);
        setSuccess("Blog created successfully!");
      }

      resetForm();
      onClose();
    } catch (err: any) {
      setError(`Error saving blog: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
            <div>
              <h3 className="text-xl font-semibold">{blog ? "Edit Blog" : "Add New Blog"}</h3>
              <p className="text-sm text-gray-500 mt-0.5">Fill all required fields (*)</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Blog post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value as BlogCategory)}
              >
                {BLOG_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 h-36 resize-none"
                placeholder="Write the blog content / description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Author Section */}
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Author</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Full name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                  />
                </div>
                <ImageUrlInput
                  value={authorImage}
                  onChange={setAuthorImage}
                  label="Author Photo URL"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>

            {/* Blog Images */}
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <MultiImageInput
                images={images}
                onChange={setImages}
                label="Blog Images"
              />
            </div>

            {/* GitHub Links */}
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <DynamicLinkInput
                links={githubLinks}
                onChange={setGithubLinks}
                label="GitHub Link"
                placeholder="https://github.com/..."
                validateFn={validateGithub}
              />
            </div>

            {/* YouTube Links */}
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <DynamicLinkInput
                links={youtubeLinks}
                onChange={setYoutubeLinks}
                label="YouTube Link"
                placeholder="https://youtube.com/watch?v=..."
                validateFn={validateYoutube}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
              >
                {loading ? "Saving..." : blog ? "Update Blog" : "Publish Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;
