import PageLayout from "@/components/PageLayout";
import { ChevronRight } from "lucide-react";


export const metadata = {
    title: "FAQ - IEEE SOU SB",
};

const FAQ_ITEMS = [
    {
        id: 1,
        question: "What is IEEE?",
        answer: "IEEE, a non-profit organization, is the world's leading professional association for the advancement of technology. The full name of the IEEE is the Institute of Electrical and Electronics Engineers, Inc., although the organization is referred to by the letters I-E-E-E and pronounced Eye-triple-E. Through its global membership, the IEEE is a leading authority on areas ranging from aerospace systems, computers and telecommunications to biomedical engineering, electric power and consumer electronics among others. Members rely on the IEEE as a source of technical and professional information, resources and services. To foster an interest in the engineering profession, the IEEE also serves student members in colleges and universities around the world. Other important constituencies include prospective members and organizations that purchase IEEE products and take part in conferences or other IEEE programs."
    },
    {
        id: 2,
        question: "Tell me about IEEE organization in India.",
        answer: "The IEEE is geographically made up of 10 Regions and 330 Sections worldwide. India belongs to Region 10 (Asia-Pacific area) and holds IEEE India Council, which coordinates the inter-Sectional activities of the ten Sections and also to give effective representation and support for the Sections in India. IEEE India Council holds eleven sections, namely, Bangalore, Bombay, Calcutta, Delhi, Gujarat, Hyderabad, Kerala, Kharagpur, Madras, Pune and Uttar Pradesh Section."
    },
    {
        id: 3,
        question: "Why join IEEE?",
        answer: "The IEEE is connecting more than 400,000 members to the latest information and the best technical resources available. IEEE Student Membership is a unique way to gauge the benefits of IEEE membership but at reduced membership rates. As student members you get almost all the resources you need to develop your future career. From continuing education courses and certifications, to conferences and competitions, you can learn more, create more, and achieve more of what matters in your life and career through IEEE membership. IEEE membership helps support the IEEE mission of promoting the engineering profession for the benefits of humanity and the profession."
    },
    {
        id: 4,
        question: "What are the benefits of IEEE?",
        answer: "i. Keep Technically Current: Discover career opportunities and gain a better understanding of your field. IEEE Spectrum and IEEE Potentials magazines. IEEE e-books classics, IEEE Xplore Abstracts of Research Papers, IEEE TV. ii. Career Recognition and Resources: Awards, Scholarship IEEE Job Site Continuing Education Provider Program. IEEE Mentoring Organization. iii. Professional Networking: Membership Networking Online Communities Networking with different IEEE Members of college student branch and state section Volunteering: Improve your organization skills, team work and leadership skills. iv. Discounts: Dell Laptop (from 3 to 8%) IEEE Conferences Free Microsoft Software More about IEEE Membership. The following information is for Asia-Pacific Region."
    },
    {
        id: 5,
        question: "What are the IEEE membership fees?",
        answer: "Full-Year Membership: $27. Half yearly rates applied to new members only. IEEE membership runs from 1 January through 31 December. The recruitment drive will ensure membership stays valid till December 2017. More About Fees Payment: Check Here."
    },
    {
        id: 6,
        question: "How to submit membership fees?",
        answer: "Student can send the membership fee to any committee member of IEEE, Student Branch. IEEE Student Branch would fill and send the fee to IEEE India on behalf of student. IEEE Student Branch starts membership drive half-yearly. Students of Silver Oak University would be informed about membership drive through a mail."
    },
    {
        id: 7,
        question: "What is the student branch Silver Oak University?",
        answer: "When students join IEEE, they automatically become members of the IEEE Student Branch at their university or college. Students, like professional members, automatically become members of their local IEEE section and region, allowing them to share technical, professional and personal interests with others in IEEE's worldwide member community. IEEE Student Branch, SOCET aim to give an interactive platform for students to develop professional and technical abilities. Since the inception, it is successful in organizing various national and state events with well-defined goals."
    },
    {
        id: 8,
        question: "What are the benefits of joining IEEE student branch EXECOMM at Silver Oak University?",
        answer: "You will gain exposure by organizing events and interacting with other members. Earn certificates, awards and accolades which gives you an edge over others in placement. All EXECOM members of IEEE Student Branch are volunteers. But on the basis of experience and responsibility, there are certain positions in the committee. So a fresher in the committee is given volunteer position. After 1 year, new committee is formed through interviews. Upgradation of the position of previous year's members take place on the basis of his/her involvement and his/her devotion towards Silver Oak University IEEE Student Branch."
    },
    {
        id: 9,
        question: "What is WIE?",
        answer: "IEEE Women in Engineering (WIE) is the largest international professional organization dedicated to promoting women engineers and scientists. The mission of IEEE WIE is to facilitate the recruitment and retention of women in technical disciplines globally. IEEE WIE envisions a vibrant community of IEEE women and men collectively using their diverse talents to innovate for the benefit of humanity."
    },
    {
        id: 10,
        question: "How to contact IEEE student branch EXECOM members?",
        answer: "Mail your query at ieee.sc@socet.edu.in"
    },
    {
        id: 11,
        question: "How can I become a member of Silver Oak University IEEE Student Branch?",
        answer: "For becoming a member of Silver Oak University IEEE Student Branch you need to register yourself as a student member or a professional member."
    },
    {
        id: 12,
        question: "How can I become a volunteer?",
        answer: "Silver Oak University IEEE Student Branch welcomes enthusiastic students for becoming volunteer for various activities held under Silver Oak University IEEE Student Branch. For yearly volunteer-ship you have to fill up the form. You can give your contribution as a volunteer in three areas of interest: Technical, Management and Design."
    },
    {
        id: 13,
        question: "What are the benefits of becoming volunteer?",
        answer: "You will get rewards based on your performance, which includes Appreciation letter, Certificate, Goodies and Best Associate Awards."
    }
];

export default function FAQ() {
    return (
    <PageLayout showFooter>
      <main className="pb-16 px-4">
                {/* Page Header */}
                <div className="border-b border-slate-100 dark:border-slate-800 pb-10 mb-10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                            Frequently Asked Questions
                        </h1>

                        <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                            Find answers to common questions about IEEE, membership, benefits, and our student branch activities.
                        </p>

                        {/* Quick nav */}
                        <div className="flex flex-wrap gap-2 mt-6">
                            {FAQ_ITEMS.map((faq) => (
                                <a
                                    key={faq.id}
                                    href={`#faq-${faq.id}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#00629B] hover:text-white transition-colors"
                                >
                                    <ChevronRight className="h-3 w-3" />
                                    Q{faq.id}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Items */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {FAQ_ITEMS.map((faq) => (
                        <section
                            key={faq.id}
                            id={`faq-${faq.id}`}
                            className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden"
                        >
                            {/* FAQ Header */}
                            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                                <div className="w-10 h-10 rounded-full bg-[#00629B] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {faq.id}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Question {faq.id}
                                    </p>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {faq.question}
                                    </h2>
                                </div>
                            </div>

                            {/* FAQ Answer */}
                            <div className="px-6 py-6">
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </section>
                    ))}

                    {/* Footer note */}
                    <div className="mt-4 p-5 rounded-xl bg-[#00629B]/5 dark:bg-[#00629B]/10 border border-[#00629B]/20 text-sm text-slate-600 dark:text-slate-300">
                        <strong className="text-[#00629B] dark:text-[#60B4E8]">Need more help?</strong>{" "}
                        Contact us at{" "}
                        <a
                            href="mailto:ieee.sc@socet.edu.in"
                            className="underline underline-offset-2 text-[#00629B] dark:text-[#60B4E8] hover:opacity-80"
                        >
                            ieee.sc@socet.edu.in
                        </a>{" "}
                        or visit our{" "}
                        <a
                            href="/contact"
                            className="underline underline-offset-2 text-[#00629B] dark:text-[#60B4E8] hover:opacity-80"
                        >
                            contact page
                        </a>
                        .
                    </div>
                </div>
            </main>
    </PageLayout>
  );
}
