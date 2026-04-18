import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global scroll-reveal observer.
 * Watches all `.reveal` elements and adds `.visible` when they enter the viewport.
 * Also handles `.animate-on-scroll` → `.animated.fade-in` and
 * `.animate-on-load` with staggered delays.
 *
 * Re-runs whenever the route changes so dynamically-rendered content
 * is picked up automatically.
 */
export default function ScrollRevealProvider() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Small delay so the DOM has rendered after route change
        const timer = setTimeout(() => {
            /* ── Reveal system (.reveal → .visible) ── */
            const revealObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("visible");
                            revealObserver.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
                revealObserver.observe(el);
            });

            /* ── Heading line (.heading-line → .visible) ── */
            const lineObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("visible");
                            lineObserver.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.3 }
            );

            document.querySelectorAll(".heading-line:not(.visible)").forEach((el) => {
                lineObserver.observe(el);
            });

            /* ── Scroll-triggered animations (.animate-on-scroll) ── */
            const scrollObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("animated", "fade-in");
                            scrollObserver.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            document
                .querySelectorAll(".animate-on-scroll:not(.animated)")
                .forEach((el) => scrollObserver.observe(el));

            /* ── Page-load staggered animations (.animate-on-load) ── */
            document
                .querySelectorAll(".animate-on-load:not(.animated)")
                .forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add("animated", "fade-in");
                    }, 100 + index * 150);
                });

            /* ── Glass card observer (.glass-card → .is-visible) ── */
            const glassObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible");
                            glassObserver.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.15 }
            );

            document
                .querySelectorAll(".glass-card:not(.is-visible)")
                .forEach((el) => glassObserver.observe(el));

            return () => {
                revealObserver.disconnect();
                lineObserver.disconnect();
                scrollObserver.disconnect();
                glassObserver.disconnect();
            };
        }, 50);

        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
}
