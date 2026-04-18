import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

const TypingContext = createContext<{
    currentIndex: number;
    incrementIndex: () => void;
    resetSequence: () => void;
} | null>(null);

export function TypingSequenceGroup({ children }: { children: ReactNode }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const incrementIndex = useCallback(() => setCurrentIndex((c) => c + 1), []);
    const resetSequence = useCallback(() => setCurrentIndex(0), []);

    return (
        <TypingContext.Provider value={{ currentIndex, incrementIndex, resetSequence }}>
            {children}
        </TypingContext.Provider>
    );
}

export function useTypingSequence() {
    return useContext(TypingContext);
}
