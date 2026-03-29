import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SiX, SiThreads } from "react-icons/si";

/* ---------- data ---------- */
const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Team", href: "/team/executive-members" },
  { label: "Bylaws", href: "/bylaws" },
  { label: "Join IEEE", href: "/join" },
];

const AFFILIATIONS = [
  { label: "SPS", href: "/about/ieee-sou-sps-sbc" },
  { label: "CS", href: "/about/ieee-sou-cs-sbc" },
  { label: "SIGHT", href: "/about/ieee-sou-sight-sbg" },
  { label: "WIE", href: "/about/ieee-sou-wie-sb-ag" },
];

const SOCIAL_LINKS = [
  { platform: "Instagram", url: "https://www.instagram.com/ieee_silveroakuni/", icon: Instagram, color: "hover:text-pink-500" },
  { platform: "X", url: "https://twitter.com/IEEE_SilverOak", icon: SiX, color: "hover:text-slate-800" },
  { platform: "Facebook", url: "https://www.facebook.com/IEEESilverOakUni", icon: Facebook, color: "hover:text-blue-600" },
  { platform: "LinkedIn", url: "https://www.linkedin.com/company/ieee-silveroakuni/", icon: Linkedin, color: "hover:text-blue-700" },
  { platform: "Threads", url: "https://www.threads.net/@ieee_silveroakuni", icon: SiThreads, color: "hover:text-gray-900" },
  { platform: "YouTube", url: "https://www.youtube.com/@ieee_silveroakuni", icon: Youtube, color: "hover:text-red-600" },
];

/* ---------- component ---------- */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const renderSocial = (name: string) => {
    const social = SOCIAL_LINKS.find((s) => s.platform === name);
    if (!social) return null;
    return (
      <a
        key={social.platform}
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Follow us on ${social.platform}`}
        className={cn(
          "flex items-center justify-center text-gray-500 transition-all duration-300 hover:scale-110",
          social.color
        )}
      >
        <social.icon className="h-5 w-5" />
      </a>
    );
  };

  return (
    <footer className="relative w-full mt-4 overflow-hidden bg-white dark:bg-[#030712] border-t border-gray-200 dark:border-white/5 select-none transition-colors duration-300">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Bottom Row (3-Column Horizontal Layout) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 relative w-full">
          
          {/* Column 1: Contact (Phone, Email, Address) */}
          <div className="flex flex-col">
            <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+917966046304" className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors duration-200">
                <Phone className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                <span>+91 79660 46304</span>
              </a>
              <a href="mailto:ieee.fbc@socet.edu.in" className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors duration-200">
                <Mail className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                <span>ieee.fbc@socet.edu.in</span>
              </a>
              <a
                href="https://maps.google.com/?q=Silver+Oak+University,+Nr.+Bhavik+Publications,+Opp.+Bhagwat+Vidyapith,+S.G.Highway,+Ahmedabad,+Gujarat+-+382481"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors duration-200 group"
              >
                <MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="leading-relaxed">
                  Silver Oak University, Nr. Bhavik Publications, Opp. Bhagwat Vidyapith, S.G.Highway, Ahmedabad, Gujarat - 382481
                </span>
              </a>
            </div>
          </div>

          {/* Column 2: Follow Us */}
          <div className="flex flex-col items-center px-0 md:px-8 lg:px-12">
            <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 mb-4 w-full text-center">Follow Us</h4>
            <div className="grid grid-cols-3 gap-4 w-36 mt-2">
              {/* Row 1 */}
              <div className="flex justify-center">
                {renderSocial("Instagram")}
              </div>
              <div className="flex justify-center">
                {renderSocial("Threads")}
              </div>
              <div className="flex justify-center">
                {renderSocial("X")}
              </div>
              
              {/* Row 2 */}
              <div className="flex justify-center">
                {renderSocial("YouTube")}
              </div>
              <div className="flex justify-center">
                {renderSocial("Facebook")}
              </div>
              <div className="flex justify-center">
                {renderSocial("LinkedIn")}
              </div>
            </div>
          </div>

          {/* Column 3: Quick Links & Network */}
          <div className="flex flex-row justify-between w-full px-0 md:px-4 lg:px-8 gap-4">
            <div className="w-1/2">
              <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200 mb-4 text-left">Quick Links</h4>
              <div className="flex flex-col gap-y-3 w-full">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-all duration-200 w-fit"
                  >
                    <ArrowRight className="h-3 w-3 text-blue-500 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 hidden sm:block" />
                    <span className="relative font-medium flex-nowrap whitespace-nowrap">
                      {link.label}
                      <span className="absolute left-0 -bottom-px h-px w-0 bg-blue-500 transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="w-1/2">
              <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-transparent mb-4 text-left select-none">Network</h4>
              <div className="flex flex-col gap-y-3 w-full">
                {AFFILIATIONS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-all duration-200 w-fit"
                  >
                    <ArrowRight className="h-3 w-3 text-blue-500 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 hidden sm:block" />
                    <span className="relative font-medium flex-nowrap whitespace-nowrap">
                      {link.label}
                      <span className="absolute left-0 -bottom-px h-px w-0 bg-blue-500 transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-gray-200 dark:border-white/5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {currentYear} <span className="text-gray-600 dark:text-gray-400 font-medium">IEEE SOU SB</span>. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link to="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">Privacy</Link>
            <span className="text-gray-300 dark:text-gray-800">·</span>
            <Link to="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
