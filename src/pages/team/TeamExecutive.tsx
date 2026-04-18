import { useState, useEffect } from "react";
import { Search, Linkedin, ChevronLeft, ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { TypingAnimation } from "@/components/TypingAnimation";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import ImageLoader from "@/components/ImageLoader";

const YEARS = Array.from({ length: 5 }, (_, i) => 2022 + i); // [2022 … 2026]

const SOCIETY_TITLES: Record<string, string> = {
  SB: "Student Branch",
  SPS: "Signal Processing Society",
  CS: "Computer Society",
  WIE: "Women in Engineering",
  SIGHT: "Special Interest Group on Humanitarian Technology",
};

const POSITION_ORDER: Record<string, number> = {
  Chairperson: 1,
  "Vice-Chairperson": 2,
  Secretary: 3,
  Treasurer: 4,
  Webmaster: 5,
};

export default function TeamExecutive() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [executiveMembers, setExecutiveMembers] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  // ── fetch members whenever selectedYear changes ──────────────────────────
  useEffect(() => {
    async function fetchExecutiveMembers() {
      setLoading(true);
      try {
        const membersRef = collection(db, "members");
        // Removing `where("year", "==", selectedYear)` from query to bypass Firebase composite index
        const q = query(
          membersRef,
          where("type", "==", "executive")
        );
        const snapshot = await getDocs(q);

        const grouped: Record<string, any[]> = {
          SB: [],
          SPS: [],
          CS: [],
          WIE: [],
          SIGHT: [],
        };

        snapshot.forEach((doc) => {
          const data = doc.data();
          // Filter by year client side
          if (Number(data.year) !== Number(selectedYear)) return;

          let pos = data.position;
          if (pos?.toLowerCase() === "vice chairperson") pos = "Vice-Chairperson";
          if (grouped[data.society]) {
            grouped[data.society].push({ ...data, position: pos, id: doc.id });
          }
        });

        // Ensure members are sorted by displayOrder before putting into the group
        Object.keys(grouped).forEach(key => {
           grouped[key].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
        });

        setExecutiveMembers(grouped);
      } catch (error) {
        console.error("Error fetching executive members:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchExecutiveMembers();
  }, [selectedYear]);

  // ── helpers ──────────────────────────────────────────────────────────────
  const filterMembers = (members: any[]) =>
    members.filter(
      (m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const sortMembers = (members: any[]) =>
    [...members].sort(
      (a, b) => (POSITION_ORDER[a.position] ?? 999) - (POSITION_ORDER[b.position] ?? 999)
    );

  // ── carousel helpers ─────────────────────────────────────────────────────
  const currentIdx = YEARS.indexOf(selectedYear);
  const canPrev = currentIdx > 0;
  const canNext = currentIdx < YEARS.length - 1;

  const prev = () => canPrev && setSelectedYear(YEARS[currentIdx - 1]);
  const next = () => canNext && setSelectedYear(YEARS[currentIdx + 1]);

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <PageLayout showFooter>
      <main className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Page heading */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white">
              Executive Team
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <TypingAnimation text={"Meet the executive members of each IEEE society."} />
            </p>
          </div>

          {/* ── Year Carousel ── */}
          <div className="flex items-center justify-center gap-4 mb-10 w-full overflow-hidden">
            {/* Left arrow */}
            <button
              onClick={prev}
              disabled={!canPrev}
              aria-label="Previous year"
              className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border transition-all duration-500 ease-in-out z-20
                ${canPrev
                  ? "border-primary text-primary hover:bg-primary hover:text-white cursor-pointer"
                  : "border-border text-muted-foreground opacity-40 cursor-not-allowed"
                }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Sliding Window */}
            <div
              className="relative w-64 h-12 flex items-center justify-center"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
              }}
            >
              {/* Static Blue Pill (Center) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[40px] bg-primary rounded-full shadow-md z-0 pointer-events-none" />

              {/* Moving Track */}
              <div
                className="absolute left-1/2 top-0 h-full flex items-center transition-transform duration-500 ease-in-out z-10"
                style={{
                  transform: `translateX(calc(-${currentIdx * 80 + 40}px))`,
                }}
              >
                {YEARS.map((yr) => {
                  const isCenter = yr === selectedYear;
                  return (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={`w-[80px] h-[40px] flex justify-center items-center flex-shrink-0 text-sm font-semibold transition-all duration-500 cursor-pointer
                        ${isCenter
                          ? "text-primary-foreground scale-110 shadow-sm"
                          : "text-muted-foreground hover:text-primary hover:scale-[1.02]"}`}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={next}
              disabled={!canNext}
              aria-label="Next year"
              className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border transition-all duration-500 ease-in-out z-20
                ${canNext
                  ? "border-primary text-primary hover:bg-primary hover:text-white cursor-pointer"
                  : "border-border text-muted-foreground opacity-40 cursor-not-allowed"
                }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Year label */}
          <div className="flex justify-center mb-10">
            <span className="text-xl font-bold text-primary tracking-wide">
              {selectedYear} Executive Members
            </span>
          </div>

          {/* Search */}
          <div className="flex justify-center mb-12">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search executive..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Member grids */}
          {loading ? (
             <div className="space-y-16">
               {[1, 2].map((group) => (
                 <div key={group}>
                   <Skeleton className="h-8 w-64 mb-6 text-primary dark:text-primary-dark" />
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
          ) : Object.values(executiveMembers).every((arr) => arr.length === 0) ? (
            <div className="text-center py-20 glass rounded-2xl border border-dashed border-border/50">
              <p className="text-xl text-muted-foreground font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-2">No executive members found for {selectedYear}.</p>
            </div>
          ) : (
            Object.entries(SOCIETY_TITLES).map(([societyKey, title]) => {
              const members = filterMembers(executiveMembers[societyKey] || []);
              if (members.length === 0) return null;
              const sorted = sortMembers(members);

              return (
                <div key={societyKey} className="mb-16">
                  <div className="text-2xl font-semibold mb-6 text-primary dark:text-primary-dark">
                    {title}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {sorted.map((member) => (
                      <div
                        key={member.id}
                        className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl
                                   hover:scale-[1.03] transition-all duration-300 p-6
                                   flex flex-col items-center text-center h-full cursor-pointer
                                   border border-white/20 dark:border-white/10"
                        style={{
                          background: 'rgba(255,255,255,0.55)',
                          backdropFilter: 'blur(20px) saturate(1.4)',
                          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                        }}
                      >
                        {/* Blurred cloud aura behind avatar */}
                        {member.image && (
                          <div
                            className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none opacity-30"
                            style={{
                              backgroundImage: `url(${member.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              filter: 'blur(22px)',
                              transform: 'translateX(-50%) scale(1.3)',
                            }}
                          />
                        )}
                        {/* Dark mode cloud */}
                        <div className="absolute inset-0 pointer-events-none dark:bg-gray-900/60 rounded-2xl" />

                        <div className="relative z-10 flex flex-col items-center w-full">
                          <ImageLoader
                            src={member.image}
                            alt={member.name}
                            containerClassName="w-28 h-28 mb-4"
                            className="w-full h-full rounded-xl object-cover border-2 border-white/60 dark:border-gray-600 shadow-md"
                          />
                          <div className="flex flex-col items-center justify-center mb-2 min-h-[48px] w-full px-2">
                            <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2">
                              {member.name}
                            </h3>
                          </div>
                          <div className="flex flex-col items-center w-full gap-2 mt-1">
                            <p className="text-xs text-gray-600 dark:text-gray-300 text-center font-semibold tracking-wide">
                              {member.position}
                            </p>
                            {member.linkedin && (
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/70 dark:bg-blue-900/40 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors shadow-sm border border-blue-100 dark:border-blue-800"
                                onClick={(e) => e.stopPropagation && e.stopPropagation()}
                              >
                                <Linkedin className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {(member.education || member.department) && (
                            <p className="text-[11px] text-muted-foreground dark:text-gray-400 mt-2 line-clamp-1">
                              {member.education || member.department}
                            </p>
                          )}
                        </div>
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
