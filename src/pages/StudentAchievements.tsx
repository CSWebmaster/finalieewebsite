import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TypingAnimation } from "@/components/TypingAnimation";

interface Achievement {
  id: string;
  year: string;
  type: "student";
  title: string;
  image: string;
  description: string;
}

export default function StudentAchievements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const awardsRef = collection(db, "awards");
        const snapshot = await getDocs(awardsRef);
        const data: Achievement[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Achievement[];
        const studentAchievements = data.filter(achievement => achievement.type === "student");
        setAchievements(studentAchievements);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    };

    fetchAchievements();
  }, []);

  const filteredAchievements = achievements.filter((achievement) =>
    achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout showFooter>
      <main className="pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Student Achievements</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <TypingAnimation text={"Celebrating the outstanding achievements of our talented students."} />
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search achievements..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold">{filteredAchievements.length}</span> achievements
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="glass rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* IMAGE — fully visible, no cropping */}
                <div className="relative bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img loading="lazy"
                    src={achievement.image}
                    alt={achievement.title}
                    className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                  />
                </div>
                {/* TITLE */}
                {/* DESCRIPTION */}
                {/* BUTTON */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{achievement.year}</p>
                  <p className="text-sm mb-4 line-clamp-2 flex-1">{achievement.description}</p>
                  <Button size="sm" asChild className="mt-auto">
                    <Link to={`/awarddetails/${achievement.id}`}>Read More</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
