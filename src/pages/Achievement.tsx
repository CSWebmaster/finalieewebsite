import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "@/lib/firestore-client";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Medal, Globe, GraduationCap, Calendar, User, Trophy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TypingAnimation } from "@/components/TypingAnimation";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FirestoreAward {
    id: string;
    year: string;
    type: "student" | "branch" | "newsletter" | string;
    title: string;
    image: string;
    description: string;
    createdAt?: any;
}

type Tab = "student" | "awards" | "branch";

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const studentData = [
    {
        id: "s1",
        title: "1st Place – Smart India Hackathon 2024",
        studentName: "Arjun Mehta",
        year: "2024",
        image: "https://placehold.co/400x220/3b82f6/ffffff?text=Hackathon+Win",
        description: "Won first place for an AI-powered disaster relief platform at the national level.",
    },
    {
        id: "s2",
        title: "Best Paper – IEEE R10 Conference",
        studentName: "Priya Shah",
        year: "2024",
        image: "https://placehold.co/400x220/6366f1/ffffff?text=Best+Paper",
        description: "Awarded Best Paper for research on energy-efficient IoT architectures.",
    },
    {
        id: "s3",
        title: "Runner-up – SSIT Global Hackathon",
        studentName: "Rahul Patel",
        year: "2023",
        image: "https://placehold.co/400x220/8b5cf6/ffffff?text=SSIT+Hackathon",
        description: "Runner-up at the IEEE SSIT Global Student Hackathon on Technology for Humanity.",
    },
    {
        id: "s4",
        title: "Published in IEEE Xplore",
        studentName: "Sneha Trivedi",
        year: "2023",
        image: "https://placehold.co/400x220/0ea5e9/ffffff?text=IEEE+Xplore",
        description: "Research paper on federated learning accepted and published in IEEE Xplore.",
    },
    {
        id: "s5",
        title: "Top 10 – IIT Bombay Techfest",
        studentName: "Dev Kapoor",
        year: "2023",
        image: "https://placehold.co/400x220/10b981/ffffff?text=Techfest+Top10",
        description: "Selected in Top 10 finalists at IIT Bombay Techfest for autonomous robotics project.",
    },
];

const branchData = [
    {
        id: "b1",
        title: "Best Student Branch Award",
        body: "IEEE Region 10",
        year: "2024",
        description:
            "Recognized as the Best Student Branch in Asia-Pacific Region 10 for outstanding activities and member engagement.",
    },
    {
        id: "b2",
        title: "Outstanding Large SB Award",
        body: "IEEE Gujarat Section",
        year: "2023",
        description:
            "Awarded for excellence in community outreach, technical events, and membership growth.",
    },
    {
        id: "b3",
        title: "Best Newsletter by a Student Branch",
        body: "IEEE India Council",
        year: "2023",
        description:
            "Our monthly newsletter was recognized as the best student branch publication across India.",
    },
    {
        id: "b4",
        title: "Silver Oak SIGHT Chapter Recognition",
        body: "IEEE SIGHT",
        year: "2022",
        description:
            "SIGHT chapter honored for impactful humanitarian technology initiatives across Ahmedabad.",
    },
];

// ─── Tab pill component ────────────────────────────────────────────────────────

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "student", label: "Student", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "awards", label: "Awards", icon: <Trophy className="h-4 w-4" /> },
    { id: "branch", label: "Branch Achievement", icon: <Globe className="h-4 w-4" /> },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Achievement() {
    const [activeTab, setActiveTab] = useState<Tab>("student");
    const [visible, setVisible] = useState(true);

    // Firebase awards
    const [awards, setAwards] = useState<FirestoreAward[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAwards = async () => {
            setLoading(true);
            try {
                const awardsRef = collection(db, "awards");
                const snapshot = await getDocs(awardsRef);
                const data: FirestoreAward[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as FirestoreAward[];
                
                // Sort client-side to avoid index requirements
                data.sort((a: any, b: any) => {
                    const timeA = a.createdAt?.toMillis?.() || 0;
                    const timeB = b.createdAt?.toMillis?.() || 0;
                    return timeB - timeA;
                });
                
                setAwards(data);
            } catch {
                // silently fail — page still shows mock data for other tabs
            } finally {
                setLoading(false);
            }
        };
        fetchAwards();
    }, []);

    // Fade transition on tab switch
    const switchTab = (tab: Tab) => {
        if (tab === activeTab) return;
        setVisible(false);
        setTimeout(() => {
            setActiveTab(tab);
            setVisible(true);
        }, 180);
    };

    const filteredAwards = awards.filter(
        (a) =>
            a.type !== "newsletter" && 
            (a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <PageLayout>
            {/* ── Hero Header ── */}
            <section className="relative pt-32 pb-14 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 overflow-hidden">
                <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)] dark:opacity-30" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                        <Trophy className="h-4 w-4" />
                        Excellence &amp; Recognition
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground tracking-tight">
                        Achievement
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        <TypingAnimation text={"Celebrating every milestone — from individual wins to branch-level honours."} />
                    </p>
                </div>
            </section>

            {/* ── Pill Tabs ── */}
            <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
                    <div className="inline-flex items-center gap-1 bg-muted rounded-full p-1 shadow-inner">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => switchTab(tab.id)}
                                className={[
                                    "inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 select-none",
                                    activeTab === tab.id
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                                ].join(" ")}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div
                className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* ── TAB 1: Student ── */}
                {activeTab === "student" && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Student Achievements</h2>
                                <p className="text-sm text-muted-foreground">
                                    Hackathons, paper publications &amp; national recognitions
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {studentData.map((item) => (
                                <Card
                                    key={item.id}
                                    className="group flex flex-col overflow-hidden border border-border/60 hover:border-blue-400/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card"
                                >
                                    <div className="image-container bg-muted/30">
                                        <img loading="lazy"
                                            src={item.image}
                                            alt={item.title}
                                            className="transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="card-content">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base leading-snug line-clamp-2">
                                                {item.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 flex-1 flex flex-col">
                                            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{item.description}</p>
                                            <div className="flex items-center justify-between pt-1 mt-auto">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <User className="h-3.5 w-3.5" />
                                                    <span className="font-medium text-foreground">{item.studentName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {item.year}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── TAB 2: Awards (Firebase) ── */}
                {activeTab === "awards" && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                                <Medal className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Awards</h2>
                                <p className="text-sm text-muted-foreground">
                                    Prestigious awards won by our students and branches
                                </p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    type="text"
                                    placeholder="Search awards..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground flex-shrink-0">
                                Showing{" "}
                                <span className="font-semibold text-foreground">{filteredAwards.length}</span>{" "}
                                awards
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="flex flex-col space-y-3 glass p-4 rounded-xl">
                                        <Skeleton className="h-48 w-full rounded-xl" />
                                        <div className="space-y-4 pt-4">
                                            <Skeleton className="h-6 w-[250px]" />
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-4/5" />
                                            <Skeleton className="h-10 w-24 mt-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredAwards.length === 0 ? (
                            <div className="text-center py-24 text-muted-foreground">
                                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p className="text-lg font-medium">No awards found</p>
                                <p className="text-sm mt-1">
                                    {awards.length === 0
                                        ? "Awards data is loading from Firebase or is currently empty."
                                        : "Try a different search term."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAwards.map((award) => (
                                    <div
                                        key={award.id}
                                        className="group card flex flex-col glass rounded-xl overflow-hidden border border-border/60 hover:border-amber-400/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="image-container bg-muted/30">
                                            <img loading="lazy"
                                                src={award.image}
                                                alt={award.title}
                                                className="transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-5 card-content">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="text-base font-bold line-clamp-1 text-foreground">
                                                    {award.title}
                                                </h3>
                                                <Badge variant="secondary" className="flex-shrink-0 text-xs">
                                                    {award.year}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {award.type === "student" ? "Student Award" : "Branch Award"}
                                            </p>
                                            <p className="text-sm mb-4 line-clamp-2 text-muted-foreground">
                                                {award.description}
                                            </p>
                                            <Button size="sm" asChild className="action-btn">
                                                <Link to={`/awarddetails/${award.id}`}>Read More</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* ── TAB 3: Branch Achievement ── */}
                {activeTab === "branch" && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                                <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Branch Achievements</h2>
                                <p className="text-sm text-muted-foreground">
                                    IEEE regional awards, recognitions &amp; milestones
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {branchData.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative p-6 rounded-xl border border-border/60 bg-card hover:border-emerald-400/50 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                >
                                    {/* Decorative blob */}
                                    <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

                                    <div className="relative space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-lg font-bold text-foreground leading-snug">
                                                {item.title}
                                            </h3>
                                            <Badge className="flex-shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border-0 font-semibold">
                                                {item.year}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center gap-2 pt-1">
                                            <Globe className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                                {item.body}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </PageLayout>
    );
}

