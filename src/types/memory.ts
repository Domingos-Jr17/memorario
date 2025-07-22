export interface Timestamp {
  toDate(): Date;
}

export interface Comment {
  userId: string;
  username: string;
  text: string;
  createdAt: Date | Timestamp;
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
  tags?: string[];
  likes?: string[]; // Array of user UIDs who liked the memory
  comments?: Comment[];
}
