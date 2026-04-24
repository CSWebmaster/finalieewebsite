import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TypingAnimation } from "@/components/TypingAnimation";
import { EventCard } from "@/components/EventCard";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  image: string;
  speakers: string;
}

export default function UpcomingEvents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // ── Reverted to legacy collection: events ──
        const eventsRef = collection(db, "events");
        const snapshot = await getDocs(eventsRef);
      const data: Event[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingEvents = data.filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setEvents(upcomingEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout showFooter>
      <main className="pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <TypingAnimation text={"Join us for exciting upcoming workshops, seminars, and technical sessions."} />
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold">{filteredEvents.length}</span> events
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event as any} />
            ))}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
