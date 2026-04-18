import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTypingSequence } from "./TypingSequence";

interface TypingAnimationProps {
    text: string;
    className?: string;
    speed?: number;
    delay?: number;
    sequenceIndex?: number;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
    text,
    className,
    speed = 5,
    delay = 0,
    sequenceIndex,
}) => {
    const [displayedText, setDisplayedText] = useState("");
    const [hasStarted, setHasStarted] = useState(false);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const elementRef = useRef<HTMLSpanElement>(null);
    const sequence = useTypingSequence();

    const [hasCompleted, setHasCompleted] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsIntersecting(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isIntersecting) return;

        let shouldStart = false;
        if (sequence && sequenceIndex !== undefined) {
            if (sequence.currentIndex >= sequenceIndex) {
                shouldStart = true;
            }
        } else {
            shouldStart = true;
        }

        if (shouldStart && !hasStarted) {
            const timeout = setTimeout(() => setHasStarted(true), delay);
            return () => clearTimeout(timeout);
        }
    }, [isIntersecting, sequence, sequenceIndex, delay, hasStarted]);

    useEffect(() => {
        if (!hasStarted) return;
        if (text.length === 0) {
            setHasCompleted(true);
            return;
        }

        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText((prev) => {
                if (index < text.length) {
                    const char = text.charAt(index);
                    index++;
                    return prev + char;
                } else {
                    clearInterval(interval);
                    setHasCompleted(true);
                    return prev;
                }
            });
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, hasStarted]);

    useEffect(() => {
        if (hasCompleted && sequence && sequenceIndex !== undefined) {
            if (sequence.currentIndex === sequenceIndex) {
                sequence.incrementIndex();
            }
        }
    }, [hasCompleted, sequence, sequenceIndex]);

    return (
        <span ref={elementRef} className={cn("inline", className)}>
            {displayedText}
            {displayedText.length < text.length && hasStarted && (
                <span className="inline-block w-[2px] h-4 bg-current animate-pulse ml-1 align-middle" />
            )}
        </span>
    );
};
