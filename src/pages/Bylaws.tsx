import PageLayout from "@/components/PageLayout";
import { ChevronRight } from "lucide-react";

export const metadata = {
    title: "Bylaws of IEEE SOU SB",
};

const ARTICLES = [
    {
        id: "I",
        title: "General",
        content: [
            "The Executive Committee shall be selected by the nomination filed by the members of the last year's Volunteer Team (as on Dec 31), preferably in January.",
            "The Executive Committee comprises of: (a) Chairperson, (b) Vice Chairperson, (c) Secretary, (d) Treasurer, (e) Webmaster.",
            "A Volunteer Team of 10–12 members shall be elected, for which elections shall be conducted as far as possible in January every year. This team will be subjected to expand twice in a year to include newly joined active members in the team (selected by current Executive Committee members).",
            "Term of each Executive Committee and the Volunteer Team shall be at least one calendar year.",
        ],
    },
    {
        id: "II",
        title: "Qualifications for Executive Officer Position",
        content: [
            "All prospective executive officers must be an IEEE Student member.",
            "All prospective executive officers must be a member of the last Volunteer Team as on Dec 31.",
            "All prospective executive officers must be in good academic standing with the Institute (at least 6.0/10.0 CPI).",
            "All prospective executive officers from B-Tech course or Post Graduation course must have completed a minimum of three or one full semester (autumn or winter) at the Institute, respectively.",
            "Students of final semester are not eligible for nominations for aforementioned executive officer positions.",
        ],
    },
    {
        id: "III",
        title: "Qualifications for Volunteer Team Member",
        content: [
            "All prospective Volunteer Team members must be an IEEE Student member.",
            "All prospective Volunteer Team members must be in good academic standing with the Institute (at least 6.0/10.0 CPI).",
            "All prospective executive officers must be in good academic standing with the Institute (at least 6.0/10.0 CPI).",
            "All prospective Volunteer Team members from B-Tech course or Post Graduation course must have completed a minimum of three or one full semester (autumn or winter) at the Institute, respectively.",
            "Students of final semester are not eligible for nominations for Volunteer Team member.",
            "A person can file nomination for only one post at a time.",
        ],
    },
    {
        id: "IV",
        title: "Qualifications for Volunteer Team Member (Additionally)",
        content: [
            "All requirements stated in Article III must be satisfied.",
            "All prospective Volunteer Team members must have recently volunteered in at least two activities of the IEEE Student Branch, SOCET.",
        ],
    },
    {
        id: "V",
        title: "Conduction of Volunteer Team Member's Elections",
        content: [
            "At least one member of the last Executive Committee, who is not contesting for any post, shall preside at the Volunteer Team member's elections. In the absence of fulfillment of this condition, the branch counselor shall preside.",
            "Nominations for Volunteer Team members shall be made no more than one week prior to the elections at a general branch meeting.",
            "10 nominees with maximum votes will be declared as the members of the Volunteer Team.",
            "In case of a tie, the Branch Counselor will have the final say.",
        ],
    },
    {
        id: "VI",
        title: "Conduction of Executive Committee Officer's Selection",
        content: [
            "The selection of officers will be on the basis of the individual credit earned.",
            "The order of selection will be: Chair, Vice Chair, Secretary, and Treasurer.",
            "In a general branch meeting, all members of the last Executive Committee and the Branch Counselor will give certain credits (on a scale of 10) to each competitor for each post.",
            "The nominee with maximum credit will be declared winner for that particular post.",
            "In case no one files nomination for any post(s), the Branch Counselor and last Executive Committee will nominate a member(s) from the last Volunteer Team (as on Dec 31) for that post(s).",
            "In case of a tie, the Branch Counselor will have the final say.",
        ],
    },
    {
        id: "VII",
        title: "Expansion of the Volunteer Team (Twice a Year)",
        content: [
            "Every twice a year (probably in April and November), nominations will be invited from IEEE Student Branch members who are not members of the Volunteer Team.",
            "In a general branch meeting, all members of the Volunteer Team, Executive Committee, and Branch Counselor will give certain credits (on a scale of 10) to each nominee.",
            "Nominees crossing the threshold of 6 × (total number of persons giving credit) will be declared as new members of the Volunteer Team.",
            "In case no one is able to cross the threshold, no expansion will be done.",
        ],
    },
    {
        id: "VIII",
        title: "Nomination for Additional Positions",
        content: [
            "The following positions would be filled at the discretion of the Branch Counselor.",
            "Batch Representative: If IEEE members from a respective batch are more than 10, the Branch Counselor, current Executive Committee, and current Volunteer Team would select the batch representative.",
        ],
    },
    {
        id: "IX",
        title: "Inactivity / Expulsion from Volunteer Team and Executive Committee",
        content: [
            "The inactivity of a Volunteer/officer is defined as: (a) Not attending branch meetings and showing disinterest in branch affairs; (b) Not performing the aforementioned duties; (c) Not abiding by the constitution of the Team/Committee; (d) Any kind of threatening behavior using the position of office-holder.",
            "Any Volunteer/officer is subject to expulsion by the Team/Committee on grounds of the aforementioned reasons.",
            "Expulsion may be initiated by any Team member or officer by mailing to the Counselor.",
            "The Counselor must call an urgent branch meeting within 3 working days of receiving such mail.",
            "The member shall be expelled by a 2/3rd majority of the Team + Committee members (present in the meeting), with the consent of the Counselor.",
        ],
    },
    {
        id: "X",
        title: "Officer Transition Procedures",
        content: [
            "A Branch Notebook shall be maintained, which must contain copies of: (a) Annual Plan, (b) Annual Report, (c) Officer Meeting Minutes, (d) Attendance rosters for faculty presentations and general meetings.",
            "The Counselor shall convene a general branch meeting within a week of announcement of election and selection results. The agenda shall be handing over of responsibilities to the newly selected Executive Committee and elected Volunteer Team members.",
            "Newly selected officers and elected Volunteer Team members shall take over office after this meeting. Outgoing officers shall then hand over their notebooks to incoming officers.",
            "Chairman and Treasurer of the SOCET Student Branch shall be authorized signatories along with the Branch Counselor for all financial matters and transactions.",
            "No product/service shall be hired/purchased on cash unless approved by above two of three authorized signatories.",
            "The Chairman shall be responsible for preparing the Annual Plan for the branch. Draft of annual plan shall be prepared by September month for the coming year.",
            "* In case of any discrepancy, the Branch Counselor's decision will be final and binding to all.",
        ],
    },
];

export default function Bylaws() {
    return (
    <PageLayout showFooter>
      <main className="pb-16 px-4">
                {/* Page Header */}
                <div className="border-b border-slate-100 dark:border-slate-800 pb-10 mb-10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">


                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                            Bylaws of IEEE SOU SB
                        </h1>

                        <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                            The official bylaws of the IEEE Student Branch at Silver Oak University, Ahmedabad, Gujarat, India. Maintained in accordance with IEEE MGA guidelines.
                        </p>

                        {/* Quick nav */}
                        <div className="flex flex-wrap gap-2 mt-6">
                            {ARTICLES.map((a) => (
                                <a
                                    key={a.id}
                                    href={`#article-${a.id}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#00629B] hover:text-white transition-colors"
                                >
                                    <ChevronRight className="h-3 w-3" />
                                    Art. {a.id}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Articles */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {ARTICLES.map((article, idx) => (
                        <section
                            key={article.id}
                            id={`article-${article.id}`}
                            className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden"
                        >
                            {/* Article Header */}
                            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                                <div className="w-10 h-10 rounded-full bg-[#00629B] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {article.id}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Article {article.id}
                                    </p>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {article.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Article Body */}
                            <div className="px-6 py-6">
                                <ol className="space-y-3">
                                    {article.content.map((clause, cIdx) => (
                                        <li key={cIdx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs flex items-center justify-center font-semibold mt-0.5">
                                                {idx + 1}.{cIdx + 1}
                                            </span>
                                            <p>{clause}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </section>
                    ))}

                    {/* Footer note */}
                    <div className="mt-4 p-5 rounded-xl bg-[#00629B]/5 dark:bg-[#00629B]/10 border border-[#00629B]/20 text-sm text-slate-600 dark:text-slate-300">
                        <strong className="text-[#00629B] dark:text-[#60B4E8]">Note:</strong>{" "}
                        These Bylaws are subject to and shall be consistent with the{" "}
                        <a
                            href="https://www.ieee.org/about/corporate/governance"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 text-[#00629B] dark:text-[#60B4E8] hover:opacity-80"
                        >
                            IEEE Constitution and Bylaws
                        </a>
                        . In the event of any conflict, the IEEE Bylaws shall prevail. Last reviewed: February 2026.
                    </div>
                </div>
            </main>
    </PageLayout>
  );
}