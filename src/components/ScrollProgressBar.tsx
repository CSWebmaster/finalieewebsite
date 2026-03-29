import { useEffect, useState } from "react";

/**
 * A thin fixed bar at the very top of the viewport that fills from left → right
 * as the user scrolls down, and empties back as they scroll up.
 */
export default function ScrollProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, pct)));
        };

        window.addEventListener("scroll", update, { passive: true });
        update(); // set initial value
        return () => window.removeEventListener("scroll", update);
    }, []);

    return (
        <div
            aria-hidden="true"
            style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, height: "3px" }}
        >
            {/* Track */}
            <div style={{ width: "100%", height: "100%", background: "transparent" }}>
                {/* Fill */}
                <div
                    style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #00629B 0%, #0ea5e9 60%, #38bdf8 100%)",
                        boxShadow: "0 0 8px 1px rgba(0,98,155,0.55)",
                        transition: "width 0.08s linear",
                        borderRadius: "0 2px 2px 0",
                    }}
                />
            </div>
        </div>
    );
}
