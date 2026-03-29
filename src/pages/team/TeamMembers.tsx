import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Linkedin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { TypingAnimation } from "@/components/TypingAnimation";
import { db } from "@/firebase"; // Import Firebase configuration
import { collection, query, where, getDocs } from "firebase/firestore";

const ITEMS_PER_PAGE = 20;

export default function TeamMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchMembers = async () => {
      const q = query(collection(db, "members"), where("type", "==", "member"));
      const querySnapshot = await getDocs(q);
      const membersData: any[] = [];
      querySnapshot.forEach((doc) => {
        membersData.push(doc.data());
      });
      membersData.sort((a, b) => a.name.localeCompare(b.name));
      setMembers(membersData);
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    const results = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(results);
    setPage(1);
  }, [searchTerm, members]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <PageLayout showFooter>
      <main className="pb-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Student Members</h1>
            <p className="text-muted-foreground">
              <TypingAnimation text={"Explore all IEEE SOU student members"} />
            </p>
          </div>

          <div className="flex justify-center mb-8">
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

          {/* Card layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {currentItems.map((member) => (
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
                      className="ml-2 text-primary hover:text-primary/80 dark:text-primary-dark dark:hover:text-primary-dark/80"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="text-sm mb-1 text-gray-700 dark:text-gray-300">
                    {member.designation}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
                  {member.education || member.department}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded-md ${page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100"}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
