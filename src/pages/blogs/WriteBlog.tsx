import { useState } from "react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BookOpen, Send, Loader2, X, ShieldCheck, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BLOG_CATEGORIES, BlogCategory } from "@/types/blog";
import MultiImageInput from "@/Admin/MultiImageInput";
import DynamicLinkInput from "@/Admin/DynamicLinkInput";

const validateGithub = (link: string) => {
  const urlPattern = /^https?:\/\/(www\.)?github\.com\//i;
  if (!urlPattern.test(link)) return "Must be a valid GitHub URL (e.g. https://github.com/...)";
  return null;
};

const validateYoutube = (link: string) => {
  const urlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i;
  if (!urlPattern.test(link)) return "Must be a valid YouTube URL";
  return null;
};

export default function WriteBlog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BlogCategory>("article");
  const [images, setImages] = useState<string[]>([""]);
  const [githubLinks, setGithubLinks] = useState<string[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification
  const [isVerified, setIsVerified] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [authorData, setAuthorData] = useState<any>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const userRef = doc(db, "users", verifyEmail.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.password === verifyPassword) {
          setAuthorData(data);
          setIsVerified(true);
          toast({ title: "Verification Successful", description: `Welcome, ${data.name}! You can now write your blog.` });
        } else {
          setVerifyError("Incorrect password.");
        }
      } else {
        setVerifyError("User not found in authorized database.");
      }
    } catch (error) {
      setVerifyError("An error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast({ title: "Error", description: "Please provide a title and content.", variant: "destructive" });
      return;
    }
    if (!authorData) {
      toast({ title: "Session Expired", description: "Please verify your identity again.", variant: "destructive" });
      setIsVerified(false);
      return;
    }

    const cleanImages = images.map(i => i.trim()).filter(i => i !== "");
    const cleanGithub = githubLinks.map(i => i.trim()).filter(i => i !== "");
    const cleanYoutube = youtubeLinks.map(i => i.trim()).filter(i => i !== "");

    // Validation
    const hasInvalidGithub = cleanGithub.some(link => validateGithub(link) !== null);
    const hasInvalidYoutube = cleanYoutube.some(link => validateYoutube(link) !== null);

    if (hasInvalidGithub || hasInvalidYoutube) {
      toast({ title: "Validation Error", description: "Please ensure all GitHub and YouTube links are formatted correctly.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "blogs"), {
        title,
        description,
        content: description, // backward compat
        category,
        status: "pending",
        author: {
          name: authorData.name,
          image: authorData.image || "",
        },
        author_name: authorData.name,
        author_email: authorData.email,
        images: cleanImages,
        image: cleanImages[0] || "",
        githubLinks: cleanGithub,
        youtubeLinks: cleanYoutube,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      toast({ title: "Submitted for Review!", description: "Your blog post has been submitted and is awaiting admin approval." });
      navigate("/blogs");
    } catch (error) {
      toast({ title: "Submission Failed", description: "An error occurred while publishing.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVerified) {
    return (
      <PageLayout>
        <main className="flex items-center justify-center pt-32 pb-16 px-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-2xl border border-border/40 shadow-xl p-8">
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="h-16 w-16 bg-[#00629B]/10 rounded-full flex items-center justify-center mb-4 border border-[#00629B]/20">
                <ShieldCheck className="w-8 h-8 text-[#00629B]" />
              </div>
              <h1 className="text-2xl font-bold">Author Verification</h1>
              <p className="text-muted-foreground text-sm mt-2">Enter your authorized credentials to access the blog editor.</p>
            </div>

            {verifyError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{verifyError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="name@ieee.org" className="pl-10"
                    value={verifyEmail} onChange={(e) => setVerifyEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" className="pl-10"
                    value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#00629B]" disabled={isVerifying}>
                {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Continue"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/blogs")}>
                Cancel
              </Button>
            </form>
          </div>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter>
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Write a New Blog</h1>
            <p className="text-muted-foreground mt-1">Share your knowledge with the IEEE SOU SB community.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/blogs")} disabled={isSubmitting}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button className="bg-[#00629B] hover:bg-[#004f7c]" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</>) : (<><Send className="mr-2 h-4 w-4" /> Publish</>)}
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-2xl border border-border/40 shadow-sm p-6 md:p-8 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Blog Title *</label>
            <Input
              placeholder="Give your article a catchy title..."
              className="text-2xl h-14 font-bold border-none bg-muted/20 focus-visible:ring-1 focus-visible:ring-[#00629B] rounded-xl"
              value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Category *</label>
            <select
              className="w-full border border-border rounded-xl px-4 py-3 bg-muted/20 text-sm font-medium focus:ring-1 focus:ring-[#00629B] focus:outline-none"
              value={category} onChange={(e) => setCategory(e.target.value as BlogCategory)} disabled={isSubmitting}
            >
              {BLOG_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Description / Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold ml-1">Content *</label>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{description.length} characters</span>
            </div>
            <Textarea
              placeholder="Start writing your masterpiece here..."
              className="min-h-[350px] text-lg leading-relaxed border-none bg-muted/20 focus-visible:ring-1 focus-visible:ring-[#00629B] rounded-xl resize-none p-6"
              value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting}
            />
          </div>

          {/* Images */}
          <div className="space-y-2 border rounded-xl p-4 bg-muted/5">
            <p className="text-sm font-semibold mb-2">Blog Images</p>
            <MultiImageInput images={images} onChange={setImages} label="Images" />
          </div>

          {/* GitHub Links */}
          <div className="space-y-2 border rounded-xl p-4 bg-muted/5">
            <DynamicLinkInput
              links={githubLinks}
              onChange={setGithubLinks}
              label="GitHub Link"
              placeholder="https://github.com/..."
              validateFn={validateGithub}
            />
            <DynamicLinkInput
              links={youtubeLinks}
              onChange={setYoutubeLinks}
              label="YouTube Link"
              placeholder="https://youtube.com/watch?v=..."
              validateFn={validateYoutube}
            />
          </div>
        </div>

        {/* Author preview */}
        {authorData && (
          <div className="mt-6 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>Posting as:</span>
            <span className="font-bold text-foreground">{authorData.name}</span>
            <span className="opacity-50">|</span>
            <span className="font-medium text-blue-600">{authorData.role}</span>
          </div>
        )}
      </main>
    </PageLayout>
  );
}
