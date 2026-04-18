import { useState, useEffect } from "react";
import { collection, getDocs } from "@/lib/firestore-client";
import { db } from "../firebase";
import { Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";

interface Award {
  id: string;
  year: string;
  type: "branch";
  title: string;
  image: string;
  description: string;
}

export default function BranchAwards() {
  const [searchTerm, setSearchTerm] = useState("");
  const [awards, setAwards] = useState<Award[]>([]);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const awardsRef = collection(db, "awards");
        const snapshot = await getDocs(awardsRef);
        const data: Award[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Award[];
        const branchAwards = data
          .filter(award => award.type === "branch")
          .sort((a, b) => Number(b.year) - Number(a.year));
        setAwards(branchAwards);
      } catch (error) {
        console.error("Error fetching awards:", error);
      }
    };

    fetchAwards();
  }, []);

  const filteredAwards = awards
    .filter((award) =>
      award.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      award.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => Number(b.year) - Number(a.year));

  // Group by year (descending)
  const groupedByYear = filteredAwards.reduce<Record<string, Award[]>>((acc, award) => {
    const year = award.year || "Unknown";
    if (!acc[year]) acc[year] = [];
    acc[year].push(award);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <PageLayout showFooter>
      <main className="pb-16 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Branch Awards</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Recognizing excellence and achievements of our IEEE branches.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search awards..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold">{filteredAwards.length}</span> awards
            </div>
          </div>

          {/* Empty state */}
          {filteredAwards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Branch awards will be displayed here once added.</p>
            </div>
          )}

          {/* Year-grouped grid */}
          {sortedYears.map((year) => (
            <div key={year} className="mb-12">
              {/* Year heading */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-primary whitespace-nowrap">{year}</h2>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedByYear[year].map((award) => (
                  <div
                    key={award.id}
                    className="glass rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
                  >
                    {/* Fixed aspect-ratio image container — fully shows all images regardless of shape */}
                    <div className="relative bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700" style={{ aspectRatio: '4/3' }}>
                      <img loading="lazy"
                        src={award.image}
                        alt={award.title}
                        className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold mb-2 line-clamp-1">{award.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{award.year}</p>
                      <p className="text-sm mb-4 line-clamp-2">{award.description}</p>
                      <Button size="sm" asChild>
                        <Link to={`/awarddetails/${award.id}`}>Read More</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </PageLayout>
  );
}

