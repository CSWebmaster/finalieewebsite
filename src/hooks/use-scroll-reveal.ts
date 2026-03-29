import { useEffect, useRef, RefObject } from "react";

/**
 * Attaches an IntersectionObserver to the returned ref.
 * - Elements with class "reveal" get class "visible" added when in view.
 * - Elements with class "heading-line" also get "visible" added for the shimmer animation.
 * Both animate once only.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
    threshold = 0.12
): RefObject<T> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold }
        );

        // Observe both .reveal and .heading-line elements
        const elements = container.querySelectorAll(".reveal, .heading-line");
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [threshold]);

    return ref;
}
