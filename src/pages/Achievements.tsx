import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Medal, Trophy, Globe, GraduationCap, Calendar, User } from "lucide-react";
import { TypingAnimation } from "@/components/TypingAnimation";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Achievements() {
    const [studentAchievements, setStudentAchievements] = useState<any[]>([]);
    const [individualAwards, setIndividualAwards] = useState<any[]>([]);
    const [branchAchievements, setBranchAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeStudent = onSnapshot(
            query(collection(db, "studentAchievements"), orderBy("year", "desc")),
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setStudentAchievements(data);
            },
            (error) => {
                console.error("Error fetching student achievements:", error);
            }
        );

        const unsubscribeAwards = onSnapshot(
            query(collection(db, "individualAwards"), orderBy("year", "desc")),
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setIndividualAwards(data);
            },
            (error) => {
                console.error("Error fetching individual awards:", error);
            }
        );

        const unsubscribeBranch = onSnapshot(
            query(collection(db, "branchAchievements"), orderBy("year", "desc")),
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setBranchAchievements(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching branch achievements:", error);
                setLoading(false);
            }
        );

        // Return cleanup function to unsubscribe from all listeners
        return () => {
            unsubscribeStudent();
            unsubscribeAwards();
            unsubscribeBranch();
        };
    }, []);
    return (
        <PageLayout>
            {/* ── Page Header ── */}
            <section className="relative pt-32 pb-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-700/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                        <Trophy className="h-4 w-4" />
                        Excellence & Recognition
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
                        Our Achievements
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        <TypingAnimation text={"Recognizing excellence across students, individuals, and the IEEE SOU SB branch — celebrating every milestone."} />
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-muted-foreground">Loading achievements...</span>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* ── Section 1: Student Achievements ── */}
                        <section id="student-achievements">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                                    <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Student Achievements</h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">Hackathons, paper publications & national recognitions</p>
                                </div>
                            </div>

                            <Separator className="mb-10" />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {studentAchievements.map((item) => (
                                    <Card
                                        key={item.id}
                                        className="group overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card"
                                    >
                                        <div className="relative h-44 overflow-hidden bg-muted/30">
                                            <img loading="lazy"
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base leading-snug line-clamp-2">{item.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                            <div className="flex items-center justify-between pt-1">
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
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* ── Section 2: Individual Awards ── */}
                        <section id="individual-awards">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                                    <Medal className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Individual Awards</h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">Named awards recognising outstanding IEEE members</p>
                                </div>
                            </div>

                            <Separator className="mb-10" />

                            <div className="space-y-4">
                                {individualAwards.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="group flex items-center gap-5 p-5 rounded-xl border border-border/60 bg-card hover:border-amber-400/50 hover:shadow-md transition-all duration-300"
                                    >
                                        {/* Index number */}
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center font-bold text-amber-700 dark:text-amber-300 text-sm">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>

                                        {/* Medal icon */}
                                        <div className="flex-shrink-0">
                                            <Medal className="h-8 w-8 text-amber-500 group-hover:scale-110 transition-transform duration-200" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold text-foreground text-base leading-tight">{item.award}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <User className="h-3.5 w-3.5" />
                                                    {item.recipient}
                                                </span>
                                                <span className="text-muted-foreground/40">•</span>
                                                <span className="text-sm text-muted-foreground">{item.body}</span>
                                            </div>
                                        </div>

                                        {/* Year badge */}
                                        <div className="flex-shrink-0">
                                            <Badge variant="secondary" className="font-semibold">
                                                {item.year}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── Section 3: Branch Achievements ── */}
                        <section id="branch-achievements">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                                    <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Branch Achievements</h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">IEEE regional awards, recognitions & milestones</p>
                                </div>
                            </div>

                            <Separator className="mb-10" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {branchAchievements.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative p-6 rounded-xl border border-border/60 bg-card hover:border-emerald-400/50 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Decorative gradient blob */}
                                        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

                                        <div className="relative space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-lg font-bold text-foreground leading-snug">{item.title}</h3>
                                                <Badge className="flex-shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border-0 font-semibold">
                                                    {item.year}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

                                            <div className="flex items-center gap-2 pt-1">
                                                <Globe className="h-4 w-4 text-emerald-500" />
                                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{item.body}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </PageLayout>
    );
}
