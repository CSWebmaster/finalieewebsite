import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Search, ChevronDown } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TypingAnimation } from "@/components/TypingAnimation";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface FirestoreAward {
  id: string;
  year: string;
  date: string;
  type: "student" | "branch";
  title: string;
  image: string;
  description: string;
}

export default function Awards() {
  const [searchTerm, setSearchTerm] = useState("");
  const [awards, setAwards] = useState<FirestoreAward[]>([]);
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAwards = async () => {
      // ── Reverted to legacy collection: awards ──
      const awardsRef = collection(db, "awards");
      const q = query(awardsRef, orderBy("year", "desc"));
      const snapshot = await getDocs(q);
      const data: FirestoreAward[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreAward[];

      // Sort by date descending (most recent first)
      const sortedByDate = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAwards(sortedByDate);

      // Default: open most recent year
      if (sortedByDate.length > 0) {
        const latestYear = sortedByDate[0].year;
        setOpenYears({ [latestYear]: true });
      }
    };

    fetchAwards();
  }, []);

  const filteredAwards = awards.filter((award) =>
    award.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    award.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by year descending
  const awardsByYear: Record<string, FirestoreAward[]> = {};
  filteredAwards.forEach((award) => {
    const yr = award.year || "Unknown";
    if (!awardsByYear[yr]) awardsByYear[yr] = [];
    awardsByYear[yr].push(award);
  });
  const sortedYears = Object.keys(awardsByYear).sort((a, b) => Number(b) - Number(a));

  const toggleYear = (year: string) => {
    setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  return (
    <PageLayout showFooter>
      <main className="pb-16 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Awards</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <TypingAnimation text={"Explore the prestigious awards won by our students and branches, recognizing excellence in various fields."} />
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

          {/* Year-grouped accordion */}
          <div className="space-y-6">
            {sortedYears.map((year) => (
              <Collapsible
                key={year}
                open={!!openYears[year]}
                onOpenChange={() => toggleYear(year)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-3 bg-primary/10 hover:bg-primary/15 rounded-lg transition-colors duration-200 group">
                  <span className="text-lg font-semibold text-primary">{year}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">{awardsByYear[year].length} award{awardsByYear[year].length !== 1 ? 's' : ''}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-primary transition-transform duration-300",
                        openYears[year] && "rotate-180"
                      )}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {awardsByYear[year].map((award) => (
                      <div
                        key={award.id}
                        className="glass flex flex-col rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="image-container bg-muted/30">
                          <img loading="lazy"
                            src={award.image}
                            alt={award.title}
                            className="transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        <div className="p-5 card-content">
                          <h3 className="text-xl font-bold mb-2 line-clamp-1">{award.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {award.year} â€¢ {award.type === "student" ? "Student" : "Branch"}
                          </p>
                          <p className="text-sm mb-4 line-clamp-2 flex-1 text-left">{award.description}</p>
                          <Button size="sm" asChild className="action-btn">
                            <Link to={`/awarddetails/${award.id}`}>Learn More</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {sortedYears.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No awards found. Try adjusting your search.
              </div>
            )}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
