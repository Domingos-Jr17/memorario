export interface Memory {
  id?: string;
  userId: string;
  title: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;
  videoUrl?: string;
  videoPublicId?: string;
  createdAt: Date;
}
