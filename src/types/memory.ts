export interface Timestamp {
  toDate(): Date;
}

export interface Memory {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  images?: Array<{
    url: string;
    publicId: string;
  }>;
  videos?: Array<{
    url: string;
    publicId: string;
  }>;
  createdAt: Date | Timestamp;
  isPublic?: boolean;
}
