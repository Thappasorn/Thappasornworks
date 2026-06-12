export type Category =
  | "graphics"
  | "shot-videos"
  | "long-form-video"
  | "filming-photography";

export interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: Category;
  tags: string[];
  client?: string;
  year?: string;
  services?: string[];
  challenge?: string;
  solution?: string;
  results?: string;
  featured: boolean;
  thumbnail?: string;
  gallery: string[];
  video_url?: string;
  /** card aspect ratio: 'landscape' = 16:9, 'portrait' = 9:16, 'square' = 1:1 (default) */
  orientation?: 'landscape' | 'portrait' | 'square';
  views?: number;
  created_at: string;
  /** fallback gradient index when no thumbnail is uploaded */
  ci?: number;
}

export interface Review {
  id: string;
  client_name: string;
  company?: string;
  position?: string;
  profile_image?: string;
  signature_image?: string;
  rating: number;
  review_text?: string;
  video_review?: string;
  project_type?: string;
  date_completed?: string;
  featured: boolean;
  ci?: number;
}

export interface TrustedBy {
  id: string;
  company_name: string;
  logo?: string;
  website?: string;
  ci?: number;
}

export const CATEGORY_META: Record<Category, { route: string; key: string }> = {
  "graphics": { route: "/graphics", key: "graphics" },
  "shot-videos": { route: "/shot-videos", key: "shorts" },
  "long-form-video": { route: "/long-form-video", key: "longs" },
  "filming-photography": { route: "/filming-photography", key: "photo" },
};

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  project_type?: string | null;
  message?: string | null;
  read: boolean;
  created_at: string;
}
