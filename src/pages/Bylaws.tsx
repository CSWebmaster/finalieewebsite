import PageLayout from "@/components/PageLayout";
import { ChevronRight } from "lucide-react";

export const metadata = {
    title: "Bylaws of IEEE SOU SB",
};

const ARTICLES = [
    {
        id: "I",
        title: "Structure and Tenure",
        content: [
            "The Executive Committee shall be selected from nominations submitted by members of the previous year's Volunteer Team (as of 31st December), preferably in January.",
            "The Executive Committee shall consist of: (a) Chairperson, (b) Vice Chairperson, (c) Secretary, (d) Treasurer, (e) Webmaster.",
            "A Volunteer Team of 10–12 members shall be elected annually, preferably in January. The team may be expanded twice a year to include active members, selected by the current Executive Committee.",
            "The tenure of the Executive Committee along with the Volunteer Team shall be one calendar year.",
        ],
    },
    {
        id: "II",
        title: "Eligibility for Executive Committee",
        content: [
            "Be an IEEE Student Member.",
            "Be part of the Volunteer Team as of 31st December.",
            "Maintain a minimum CPI of 6.0/10.0.",
            "Not be in the final semester.",
        ],
    },
    {
        id: "III",
        title: "Eligibility for Volunteer Team",
        content: [
            "Be an IEEE Student Member.",
            "Maintain a minimum CPI of 6.0/10.0.",
            "Not be in the final semester.",
            "Applicants may apply for multiple positions; however, they shall be selected for only one position.",
        ],
    },
    {
        id: "IV",
        title: "Additional Criteria for Volunteer Team",
        content: [
            "All requirements stated in Article III must be satisfied.",
            "Applicants must have actively volunteered in at least two IEEE SOU SB activities.",
        ],
    },
    {
        id: "V",
        title: "Election of Volunteer Team",
        content: [
            "Elections shall be conducted at a General Branch Meeting under the supervision of a non-contesting member of the previous Executive Committee or, if unavailable, the Branch Counsellor.",
            "Nominations shall be submitted no later than one week prior to the election.",
            "The ten candidates receiving the highest number of votes shall be elected.",
            "In case of a tie affecting selection, the Branch Counsellor's decision shall be final.",
        ],
    },
    {
        id: "VI",
        title: "Selection of Executive Committee",
        content: [
            "Selection shall be based on an individual credit evaluation system.",
            "The order of selection shall be Chairperson, Vice Chairperson, Secretary, Treasurer and Webmaster.",
            "Credits (out of 10) shall be assigned by members of the previous Executive Committee along with the Branch Counsellor.",
            "The candidate securing the highest total credit shall be selected.",
            "If no nominations are received, candidates may be nominated from the previous Volunteer Team.",
            "In case of a tie, the Branch Counsellor shall have the final decision.",
        ],
    },
    {
        id: "VII",
        title: "Expansion of Volunteer Team",
        content: [
            "Expansion shall take place twice annually, typically in April as well as November.",
            "Credits (out of 10) shall be assigned by the Executive Committee along with the Volunteer Team as well as the Branch Counsellor.",
            "Candidates scoring above 6 × (number of evaluators) shall be selected.",
            "If no candidate meets the threshold, expansion shall not take place.",
        ],
    },
    {
        id: "VIII",
        title: "Additional Positions",
        content: [
            "Additional roles may be introduced at the discretion of Branch Counsellor.",
            "Batch Representatives may be appointed where a batch has more than 10 IEEE members, through selection by Executive Committee along with Volunteer Team as well as Branch Counsellor.",
        ],
    },
    {
        id: "IX",
        title: "Inactivity and Expulsion",
        content: [
            "Grounds for inactivity include: (a) Participation in meetings; (b) Failure to perform assigned duties; (c) Violation of bylaws; (d) Misuse of authority.",
            "Members may be expelled on valid grounds.",
            "Expulsion proceedings shall be initiated through formal communication to the Branch Counsellor.",
            "A meeting shall be convened within 3 working days.",
            "Expulsion requires a 2/3 majority vote along with approval of the Branch Counsellor.",
        ],
    },
    {
        id: "X",
        title: "Transition and Operations",
        content: [
            "A Branch Notebook shall be maintained, including Annual Plan, Annual Report, meeting minutes as well as attendance records.",
            "A transition meeting shall be conducted within one week of the announcement of results.",
            "Responsibilities shall be formally handed over during this meeting.",
            "The Chairperson along with the Treasurer, as well as the Branch Counsellor, shall serve as authorised signatories.",
            "Financial transactions require approval from at least two of the three authorised signatories.",
            "The Chairperson shall prepare the Annual Plan by September for the following year.",
            "In case of any discrepancy, the Branch Counsellor's decision shall be final as well as binding.",
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