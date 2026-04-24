import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import LinkedInIcon from "@/components/LinkedInIcon";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { TypingAnimation } from "@/components/TypingAnimation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import ImageLoader from "@/components/ImageLoader";

interface Member {
  id: string;
  name: string;
  department: string;
  designation: string;
  image: string;
  linkedin: string;
  type: string;
  founding?: boolean;
  createdAt?: any;
}

export default function TeamFaculty() {
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyMembers, setFacultyMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyMembers = async () => {
      if (!db) {
        console.warn("Firestore 'db' is not initialized. Faculty members will not be loaded.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // ── Reverted to legacy collection: members ──
        const membersRef = collection(db, "members");
        const q = query(membersRef, where("type", "==", "faculty"));
        const snapshot = await getDocs(q);

        const data: Member[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
          }))
          // Sort by display order client-side
          .sort((a: any, b: any) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

        setFacultyMembers(data);
      } catch (error) {
        console.error("Error fetching faculty members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyMembers();
  }, []);


  const filtered = facultyMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const foundingMember = filtered.find((member) => member.founding);
  const otherMembers = filtered.filter((member) => !member.founding);

  // Non-founding members are already sorted by displayOrder from the .sort() call during fetch.
  // DO NOT re-sort here — it would override the displayOrder.
  const sortedOtherMembers = otherMembers; // Already sorted by displayOrder ascending

  return (
    <PageLayout showFooter>
      <main className="pb-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Faculty Members
            </h1>
            <p className="text-lg text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
              <TypingAnimation text={"Meet the faculty guiding IEEE SOU Student Branch."} />
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center mb-10">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search faculty..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-16">
              <div className="flex justify-center mb-12">
                <Skeleton className="w-full max-w-3xl h-[280px] sm:h-[220px] rounded-xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 glass rounded-xl shadow-md p-6 flex flex-col items-center text-center h-[340px]">
                    <Skeleton className="w-32 h-32 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-6" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass rounded-2xl border border-dashed border-border/50">
              <p className="text-xl text-muted-foreground font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-2">No faculty members are listed at this time.</p>
            </div>
          ) : (
            <>
              {/* Founding Member */}
              {foundingMember && (
                <div className="mb-12">
                  <h2 className="text-3xl font-semibold mb-8 text-center text-gray-900 dark:text-white">
                    Branch Counselor & Founding Member
                  </h2>
                  <div
                    className="bg-white dark:bg-gray-900 glass rounded-xl shadow-xl 
                               dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] 
                               transition-all duration-300 overflow-hidden p-8 
                               max-w-3xl mx-auto flex flex-col sm:flex-row items-center text-center sm:text-left gap-8"
                  >
                    <ImageLoader
                      src={foundingMember.image}
                      alt={foundingMember.name}
                      containerClassName="w-36 h-36 flex-shrink-0"
                      className="w-full h-full rounded-lg object-cover border-4 border-primary"
                      style={{ objectPosition: (foundingMember as any).objectPosition || 'center 20%' }}
                    />
                    <div>
                      <div className="flex items-center justify-center sm:justify-start mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {foundingMember.name}
                        </h3>
                        <LinkedInIcon href={foundingMember.linkedin} />
                      </div>
                      <p className="text-base mb-2 text-gray-600 dark:text-gray-300">
                        {foundingMember.designation}
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        {foundingMember.department}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Members */}
              {sortedOtherMembers.length > 0 && (
                <div className="mt-16">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedOtherMembers.map((member) => (
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
                          style={{ objectPosition: (member as any).objectPosition || 'center 20%' }}
                        />
                        <div className="flex flex-col items-center justify-center mb-2 min-h-[56px] w-full px-2">
                          <h3 className="font-semibold text-xl text-gray-900 dark:text-white line-clamp-2">
                            {member.name}
                          </h3>
                        </div>
                        <div className="flex-grow flex flex-col items-center justify-start w-full gap-3 mt-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
                            {member.designation}
                          </p>
                          <LinkedInIcon
                            href={member.linkedin}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
                          {member.department}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </PageLayout>
  );
}
