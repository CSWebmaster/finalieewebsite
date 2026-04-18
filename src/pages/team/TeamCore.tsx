import { useState, useEffect } from "react";
import { Search, Linkedin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { TypingAnimation } from "@/components/TypingAnimation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import ImageLoader from "@/components/ImageLoader";

// Define the committee titles that we expect to find in the database
const COMMITTEE_TITLES = [
  "Technical Committee",
  "Content Committee",
  "Curation Committee",
  "Creative Committee",
  "Outreach Committee",
  "Management Committee",
  "Social Media Committee",
];

// Define position priority
const POSITION_PRIORITY: Record<string, number> = {
  "chairperson": 1,
  "vice chairperson": 2,
  "interim chairperson": 3,
  "interim vice chairperson": 4,
};

// Using a consistent hover effect for all members
const HOVER_EFFECT = "hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-[1.02] transition-transform";

export default function TeamCore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [coreMembers, setCoreMembers] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoreMembers() {
      setLoading(true);
      try {
        const membersRef = collection(db, "members");
        // Removed orderBy("displayOrder", "asc") to avoid composite index requirement
        const q = query(membersRef, where("type", "==", "core"));
        const querySnapshot = await getDocs(q);

        const grouped: Record<string, any[]> = {};
        COMMITTEE_TITLES.forEach((committee) => {
          grouped[committee] = [];
        });

        const allDocs: any[] = [];
        querySnapshot.forEach((doc) => {
          allDocs.push({ ...doc.data(), id: doc.id });
        });

        // Sort by display order manually
        allDocs.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

        allDocs.forEach((data) => {
          const committee = data.committee;

          if (COMMITTEE_TITLES.includes(committee)) {
            // Normalize position for consistency
            let position = data.position;
            if (position?.toLowerCase() === "vice chairperson") {
              position = "Vice-Chairperson";
            } else if (position?.toLowerCase() === "interim chairperson") {
              position = "Interim Chairperson";
            } else if (position?.toLowerCase() === "interim vice chairperson") {
              position = "Interim Vice-Chairperson";
            }
            
            grouped[committee].push({ ...data, position });
          }
        });

        setCoreMembers(grouped);
      } catch (error) {
        console.error("Error fetching core members:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCoreMembers();
  }, []);

  const normalize = (pos: string) =>
    pos?.toLowerCase().replace(/-/g, " ").trim();

  const sortMembers = (members: any[]) => {
    return [...members].sort((a, b) => {
      const posA = POSITION_PRIORITY[normalize(a.position)] || 99;
      const posB = POSITION_PRIORITY[normalize(b.position)] || 99;
      return posA - posB;
    });
  };

  const filterMembers = (members: any[]) =>
    sortMembers(
      members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (member.designation &&
            member.designation.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );

  return (
    <PageLayout showFooter>
      <main className="pb-16 animate-fade-in bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white">
              Core Committee
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto dark:text-muted-foreground-dark">
              <TypingAnimation text={"Meet the core team members of each IEEE committee."} />
            </p>
          </div>

          {/* Search Input */}
          <div className="flex justify-center mb-12">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search members..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Display committees */}
          {loading ? (
             <div className="space-y-16">
               {[1, 2].map((group) => (
                 <div key={group}>
                   <Skeleton className="h-8 w-64 mb-6 text-primary dark:text-primary-dark" />
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                     {[1, 2, 3, 4, 5].map((i) => (
                       <div key={i} className="bg-white dark:bg-gray-900 glass rounded-xl shadow-md p-6 flex flex-col items-center text-center h-[340px]">
                         <Skeleton className="w-32 h-32 rounded-lg mb-4" />
                         <Skeleton className="h-6 w-3/4 mb-6" />
                         <Skeleton className="h-4 w-full mb-2" />
                         <Skeleton className="h-3 w-5/6" />
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
          ) : Object.values(coreMembers).every(arr => arr.length === 0) ? (
            <div className="text-center py-20 glass rounded-2xl border border-dashed border-border/50">
              <p className="text-xl text-muted-foreground font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-2">No core committee members are listed at this time.</p>
            </div>
          ) : (
            COMMITTEE_TITLES.map((committee) => {
              const members = filterMembers(coreMembers[committee] || []);
              if (members.length === 0) return null;

              return (
                <div key={committee} className="mb-16">
                  <h2 className="text-2xl font-semibold mb-6 text-primary dark:text-primary-dark">
                    {committee}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white dark:bg-gray-900 glass rounded-xl overflow-hidden shadow-md hover:shadow-lg 
                                   dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.7)] hover:scale-[1.02]
                                   transition-all duration-300 p-6 flex flex-col items-center text-center h-full cursor-pointer relative"
                      >
                        <ImageLoader
                          src={member.image}
                          alt={member.name}
                          containerClassName="w-32 h-32 mb-4"
                          className="w-full h-full rounded-lg object-cover border-2 border-muted dark:border-gray-700"
                        />
                        <div className="flex flex-col items-center justify-center mb-2 min-h-[56px] w-full px-2">
                          <h3 className="font-semibold text-xl text-gray-900 dark:text-white line-clamp-2">
                            {member.name}
                          </h3>
                        </div>
                        <div className="flex-grow flex flex-col items-center justify-start w-full gap-3 mt-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
                            {member.position}
                          </p>
                          {member.linkedin && (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                              onClick={(e) => e.stopPropagation && e.stopPropagation()}
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {(member.education || member.department) && (
                          <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
                            {member.education || member.department}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </PageLayout>
  );
}
