import { useState, useEffect } from "react";
import { Search, Linkedin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TypingAnimation } from "@/components/TypingAnimation";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useLatencyTracker } from "@/hooks/useLatencyTracker";
import { SmartLoader } from "@/components/performance/SmartLoader";
import { LazyImage } from "@/components/performance/LazyImage";

type MemberType = {
  id: string;
  name: string;
  department: string;
  designation: string;
  enrolledYear: string;
  image: string;
  linkedinUrl: string;
  type: "faculty" | "advisory" | "executive" | "core" | "member";
};

const FACULTY_MEMBERS: MemberType[] = [
  {
    id: "f1",
    name: "Prof. Digant Parmar",
    department: "Computer Engineering",
    designation: "Assistant Professor",
    enrolledYear: "2018",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=21",
    linkedinUrl: "https://linkedin.com/in/",
    type: "faculty"
  },
  {
    id: "f2",
    name: "Prof. Mayuresh Kulkarani",
    department: "Electronics Engineering",
    designation: "Senior Faculty",
    enrolledYear: "2017",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=22",
    linkedinUrl: "https://linkedin.com/in/",
    type: "faculty"
  },
  {
    id: "f3",
    name: "Prof. Kiran Shah",
    department: "Information Technology",
    designation: "Associate Professor",
    enrolledYear: "2019",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=23",
    linkedinUrl: "https://linkedin.com/in/",
    type: "faculty"
  }
];

const ADVISORY_MEMBERS: MemberType[] = [
  {
    id: "a1",
    name: "Dr. Rajesh Mehta",
    department: "Computer Science",
    designation: "IEEE Senior Member",
    enrolledYear: "2020",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=11",
    linkedinUrl: "https://linkedin.com/in/",
    type: "advisory"
  },
  {
    id: "a2",
    name: "Dr. Priya Sharma",
    department: "Electronics & Communication",
    designation: "Industry Expert",
    enrolledYear: "2021",
    image: "https://xsgames.co/randomusers/avatar.php?g=female&seed=12",
    linkedinUrl: "https://linkedin.com/in/",
    type: "advisory"
  },
  {
    id: "a3",
    name: "Dr. Anand Patel",
    department: "Electrical Engineering",
    designation: "Research Mentor",
    enrolledYear: "2019",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=13",
    linkedinUrl: "https://linkedin.com/in/",
    type: "advisory"
  },
  {
    id: "a4",
    name: "Dr. Neha Desai",
    department: "Computer Engineering",
    designation: "Academic Advisor",
    enrolledYear: "2020",
    image: "https://xsgames.co/randomusers/avatar.php?g=female&seed=14",
    linkedinUrl: "https://linkedin.com/in/",
    type: "advisory"
  }
];

const STUDENT_MEMBERS: MemberType[] = [
  {
    id: "1",
    name: "Rajat Aswani",
    department: "Computer Engineering",
    designation: "Software Engineer",
    enrolledYear: "2023",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=1",
    linkedinUrl: "https://linkedin.com/in/rajat-aswani",
    type: "executive"
  },
  {
    id: "2",
    name: "Aryan Patel",
    department: "Electronics Engineering",
    designation: "UI/UX Designer",
    enrolledYear: "2022",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=2",
    linkedinUrl: "https://linkedin.com/in/",
    type: "executive"
  },
  {
    id: "3",
    name: "Priya Sharma",
    department: "Computer Science",
    designation: "Content Creator",
    enrolledYear: "2022",
    image: "https://xsgames.co/randomusers/avatar.php?g=female&seed=3",
    linkedinUrl: "https://linkedin.com/in/",
    type: "executive"
  },
  {
    id: "4",
    name: "Karan Mehta",
    department: "Electrical Engineering",
    designation: "Frontend Developer",
    enrolledYear: "2022",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=4",
    linkedinUrl: "https://linkedin.com/in/",
    type: "core"
  },
  {
    id: "5",
    name: "Sneha Desai",
    department: "Computer Engineering",
    designation: "Data Scientist",
    enrolledYear: "2022",
    image: "https://xsgames.co/randomusers/avatar.php?g=female&seed=5",
    linkedinUrl: "https://linkedin.com/in/",
    type: "core"
  },
  {
    id: "6",
    name: "Rohan Joshi",
    department: "Electronics & Communication",
    designation: "Tech Enthusiast",
    enrolledYear: "2023",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=6",
    linkedinUrl: "https://linkedin.com/in/",
    type: "core"
  },
  {
    id: "7",
    name: "Neha Singh",
    department: "Information Technology",
    designation: "Graphic Designer",
    enrolledYear: "2023",
    image: "https://xsgames.co/randomusers/avatar.php?g=female&seed=7",
    linkedinUrl: "https://linkedin.com/in/",
    type: "core"
  },
  {
    id: "8",
    name: "Rahul Kumar",
    department: "Computer Engineering",
    designation: "Backend Developer",
    enrolledYear: "2023",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=8",
    linkedinUrl: "https://linkedin.com/in/",
    type: "member"
  },
  {
    id: "9",
    name: "Anjali Patel",
    department: "Electronics Engineering",
    designation: "IoT Specialist",
    enrolledYear: "2023",
    image: "https://xsgames.co/randomusers/avatar.php?g=female&seed=9",
    linkedinUrl: "https://linkedin.com/in/",
    type: "member"
  },
  {
    id: "10",
    name: "Vikram Shah",
    department: "Information Technology",
    designation: "Musician",
    enrolledYear: "2023",
    image: "https://xsgames.co/randomusers/avatar.php?g=male&seed=10",
    linkedinUrl: "https://linkedin.com/in/",
    type: "member"
  }
];

export default function Members() {
  useLatencyTracker("MembersPage");
  const [searchTerm, setSearchTerm] = useState("");
  const [allMembers, setAllMembers] = useState<MemberType[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<{
    faculty: MemberType[];
    advisory: MemberType[];
    students: MemberType[];
  }>({
    faculty: [],
    advisory: [],
    students: [],
  });
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "members"),
      (snapshot) => {
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as MemberType[];
        
        // Sort by enrolledYear descending
        const sortedMembers = membersData.sort((a, b) => {
          const yearA = parseInt(a.enrolledYear);
          const yearB = parseInt(b.enrolledYear);
          return yearB - yearA;
        });
        
        setAllMembers(sortedMembers);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching members:", error);
        setLoading(false);
      }
    );

    // Return cleanup function to unsubscribe from listener
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = allMembers.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort student members by type: executive first, then core, then regular members
    const filteredStudents = filtered.filter(m => m.type === "executive" || m.type === "core" || m.type === "member");
    filteredStudents.sort((a, b) => {
      const typeOrder = { executive: 1, core: 2, member: 3 };
      return typeOrder[a.type as "executive" | "core" | "member"] - typeOrder[b.type as "executive" | "core" | "member"];
    });

    setFilteredMembers({
      faculty: filtered.filter(m => m.type === "faculty"),
      advisory: filtered.filter(m => m.type === "advisory"),
      students: filteredStudents,
    });
  }, [searchTerm, allMembers]);

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "executive":
        return "default";
      case "core":
        return "secondary";
      case "advisory":
        return "outline";
      default:
        return "outline";
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "executive":
        return "bg-amber-500 hover:bg-amber-600 border-none";
      case "core":
        return "bg-gray-400 hover:bg-gray-500 border-none";
      case "advisory":
        return "bg-blue-500 hover:bg-blue-600 text-white border-none";
      default:
        return "";
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case "executive":
        return "exe";
      case "core":
        return "core";
      case "advisory":
        return "advisory";
      default:
        return "member";
    }
  };

  const totalFilteredCount = filteredMembers.faculty.length + filteredMembers.advisory.length + filteredMembers.students.length;

  const isFacultySection = (title: string) => title === "Faculty Members";

  const renderMemberSection = (title: string, members: MemberType[]) => {
    if (members.length === 0) return null;

    const gridClass = isFacultySection(title)
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-3">{title}</h2>
        <div className={gridClass}>
          {members.map(member => (
            <a
              key={member.id}
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer block"
            >
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <LazyImage
                    src={member.image}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover mr-4 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-lg truncate">{member.name}</h3>
                      <Linkedin className="h-4 w-4 text-primary flex-shrink-0" />
                    </div>
                    {member.type !== "faculty" && (
                      <Badge variant={getBadgeVariant(member.type)} className={`mt-1 ${getBadgeStyle(member.type)}`}>
                        {getBadgeText(member.type)}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Department:</span> {member.department}</p>
                  <p><span className="font-medium">Designation:</span> {member.designation}</p>
                  <p><span className="font-medium">Enrolled:</span> {member.enrolledYear}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <PageLayout showFooter>
      <main className="pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Members</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <TypingAnimation text={"Meet the dedicated team behind IEEE SOU Student Branch who are working to create a vibrant technical community."} />
            </p>
          </div>

          <SmartLoader
            type="none"
          >
            <>
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search members..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold">{totalFilteredCount}</span> members
                </div>
              </div>

              {renderMemberSection("Faculty Members", filteredMembers.faculty)}
              {renderMemberSection("Student Executive Committee", filteredMembers.advisory)}
              {renderMemberSection("Student Members", filteredMembers.students)}
            </>
          </SmartLoader>
        </div>
      </main>
    </PageLayout>
  );
}
