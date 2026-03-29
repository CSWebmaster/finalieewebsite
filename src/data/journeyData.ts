export type GalleryItem = {
  imageUrl: string;
  caption: string;
  description: string;
};

export type JourneyItem = {
  id: string;
  title: string;
  details: string;
  description: string;
  imageUrl: string;
  year?: string;
  gallery?: GalleryItem[];
};

export const journeyItems: JourneyItem[] = [];