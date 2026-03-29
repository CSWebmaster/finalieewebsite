// SIG type is now defined in SIGs.tsx and sourced from Firestore.
// This file is kept for backward compatibility with SIGDetails page.

export interface SIGItem {
  id: string;
  title: string;
  imageUrl: string;
  images?: string[];
  details: string;
  order?: number;
}

// Hardcoded data removed — SIGs are now fully managed from Admin panel (Firestore).
// See: src/pages/SIGs.tsx for Firestore fetch logic.
export const sigItems: SIGItem[] = [];