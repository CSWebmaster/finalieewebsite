import { useState, useEffect } from "react";
import { Search, Linkedin, ChevronLeft, ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { TypingAnimation } from "@/components/TypingAnimation";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const YEARS = Array.from({ length: 10 }, (_, i) => 2017 + i); // [2017 … 2026]

const SOCIETY_TITLES: Record<string, string> = {
  SB: "Student Branch",
  WIE: "Women in Engineering",
  SPS: "Signal Processing Society",
  CS: "Computer Society",
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

  // ── fetch members whenever selectedYear changes ──────────────────────────
  useEffect(() => {
    async function fetchExecutiveMembers() {
      const membersRef = collection(db, "members");
      const q = query(
        membersRef,
        where("type", "==", "executive"),
        where("year", "==", selectedYear)
      );
      const snapshot = await getDocs(q);

      const grouped: Record<string, any[]> = {
        SB: [],
        WIE: [],
        SPS: [],
        CS: [],
        SIGHT: [],
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        let pos = data.position;
        if (pos?.toLowerCase() === "vice chairperson") pos = "Vice-Chairperson";
        if (grouped[data.society]) {
          grouped[data.society].push({ ...data, position: pos, id: doc.id });
        }
      });

      setExecutiveMembers(grouped);
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
          {Object.entries(SOCIETY_TITLES).map(([societyKey, title]) => {
            const members = filterMembers(executiveMembers[societyKey] || []);
            if (members.length === 0) return null;
            const sorted = sortMembers(members);

            return (
              <div key={societyKey} className="mb-16">
                <div className="text-2xl font-semibold mb-6 text-primary dark:text-primary-dark">
                  {title}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {sorted.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white dark:bg-gray-900 glass rounded-xl overflow-hidden shadow-md hover:shadow-lg 
                                 dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.7)] hover:scale-[1.02]
                                 transition-all duration-300 p-6 flex flex-col items-center text-center h-full cursor-pointer"
                    >
                      <img loading="lazy"
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 rounded-lg object-cover mb-4 border-2 border-muted dark:border-gray-700"
                      />
                      <div className="flex items-center justify-center mb-2">
                        <h3 className="font-semibold text-xl text-gray-900 dark:text-white">
                          {member.name}
                        </h3>
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary hover:text-primary/80"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm mb-1 text-gray-700 dark:text-gray-300">
                          {member.position}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
                        {member.education || member.department}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {Object.values(executiveMembers).every((arr) => arr.length === 0) && (
            <div className="text-center py-24 text-muted-foreground">
              <p className="text-lg">No executive members found for {selectedYear}.</p>
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  );
}
