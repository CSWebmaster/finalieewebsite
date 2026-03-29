import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Search, Award, ExternalLink } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TypingAnimation } from "@/components/TypingAnimation";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsletterItem {
  id: string;
  title: string;
  image: string;
  images?: string[];
  description: string;
  year: string;
  newsletterType?: string;
  type: "newsletter";
}

export default function Newsletter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const awardsRef = collection(db, "awards");
        const q = query(awardsRef, where("type", "==", "newsletter"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as NewsletterItem[];
        // Sort client-side to avoid composite index requirement
        data.sort((a, b) => {
          const yearA = parseInt(a.year) || 0;
          const yearB = parseInt(b.year) || 0;
          return yearB - yearA;
        });
        setItems(data);
      } catch (err) {
        console.error("Error fetching newsletters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletters();
  }, []);

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFirstImage = (item: NewsletterItem) => {
    if (item.images?.length) return item.images[0];
    return item.image || "";
  };

  return (
    <PageLayout showFooter>
      <main className="pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Newsletter</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <TypingAnimation text={"Stay updated with our latest news, events, and achievements."} />
            </p>
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search newsletters..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold">{filtered.length}</span> newsletters
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass rounded-lg overflow-hidden shadow-sm flex flex-col p-4 border border-border">
                  <Skeleton className="w-full aspect-[4/3] rounded-md mb-4" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-6 w-[80%]" />
                    <Skeleton className="h-4 w-[20%]" />
                    <Skeleton className="h-4 w-[30%] rounded-full" />
                    <div className="pt-2 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[90%]" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-24 rounded-md mt-6" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {searchTerm ? "No results found" : "Coming Soon"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {searchTerm
                  ? "Try adjusting your search."
                  : "Newsletter editions will appear here once added by admin."}
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => {
                const img = getFirstImage(item);
                return (
                  <div
                    key={item.id}
                    className="glass rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700 flex flex-col"
                  >
                    {/* Image — fully visible, no crop */}
                    <div className="relative bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      {img ? (
                        <img
                          loading="lazy"
                          src={img}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Award className="h-12 w-12 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Text content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-xl font-bold mb-2 line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{item.year}</p>
                      {item.newsletterType && (
                        <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 w-fit">
                          {item.newsletterType.replace("_", " ")}
                        </span>
                      )}
                      <p className="text-sm mb-4 line-clamp-2 flex-1">{item.description}</p>

                      {/* Button at bottom */}
                      <Button size="sm" asChild className="mt-auto">
                        <Link to={`/awarddetails/${item.id}`}>Read More</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  );
}
