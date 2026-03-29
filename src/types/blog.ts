export type BlogCategory = "blog" | "research" | "article" | "project";

export const BLOG_CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: "blog", label: "Blog" },
  { value: "research", label: "Research Paper" },
  { value: "article", label: "Article" },
  { value: "project", label: "Project Showcase" },
];

export interface Blog {
  id?: string;
  title: string;
  description: string;
  category: BlogCategory;
  author: {
    name: string;
    image: string;
  };
  images: string[];
  githubLinks: string[];
  youtubeLinks: string[];
  status?: "pending" | "approved" | "rejected";
  created_at?: any;
  updated_at?: any;
}
