import { STORAGE_BUCKETS, UPLOAD_CONFIGS } from "@/lib/supabase/storage";

export { STORAGE_BUCKETS, UPLOAD_CONFIGS };

export type UploadType = keyof typeof STORAGE_BUCKETS;

export const UPLOAD_PATHS = {
  AVATAR: (userId: string) => `avatars/${userId}/${Date.now()}`,
  NEWS_IMAGE: (slug: string) => `news/${slug}/${Date.now()}`,
  GALLERY_PHOTO: (categoryId: string) => `gallery/${categoryId}/${Date.now()}`,
  GALLERY_VIDEO: (categoryId: string) => `videos/${categoryId}/${Date.now()}`,
  DOCUMENT: (type: string) => `documents/${type}/${Date.now()}`,
} as const;

export const UPLOAD_DIMENSIONS = {
  AVATAR: { width: 300, height: 300 },
  NEWS: { width: 1200, height: 630 },
  GALLERY: { width: 1920, height: 1080 },
} as const;
