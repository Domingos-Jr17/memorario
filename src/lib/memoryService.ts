/* eslint-disable @typescript-eslint/no-explicit-any */
import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  startAfter,
  getDoc,
  Query,
} from 'firebase/firestore';
import axios from 'axios';
import { Memory, MemoryComment } from '@/types/memory';

const memoriesCollectionRef = collection(db, 'memories');

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

const uploadFileToCloudinary = async (
  file: File
): Promise<CloudinaryUploadResult> => {
  const { data: signData } = await axios.post('/api/cloudinary/sign-upload', {
    folder: 'memories',
    tags: ['memory'],
  }, { timeout: 10000 }); // 10-second timeout for signing

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signData.api_key);
  formData.append('timestamp', signData.timestamp);
  formData.append('signature', signData.signature);
  formData.append('folder', 'memories');
  formData.append('tags', ['memory'].join(',')); // Adicionado para corresponder à assinatura

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${signData.cloud_name}/auto/upload`,
    formData,
    {
      timeout: 60000, // 60-second timeout for upload
    }
  );

  return response.data;
};

const deleteFileFromCloudinary = async (publicId: string) => {
  const response = await fetch('/api/upload-cloudinary', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete file from Cloudinary');
  }

  return response.json();
};

export const addMemory = async (
  title: string,
  description: string = '',
  isPublic: boolean = false,
  imageFiles: File[] = [],
  videoFiles: File[] = [],
  tags: string[] = [],
  onOverallProgress?: (progress: number) => void,
  onUploadStartEnd?: (isUploading: boolean) => void
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const images: { url: string; publicId: string }[] = [];
  const videos: { url: string; publicId: string }[] = [];

  const totalFiles = imageFiles.length + videoFiles.length;
  let uploadedFilesCount = 0;

  if (onUploadStartEnd) onUploadStartEnd(true);

  const uploadPromises: Promise<void>[] = [];

  const uploadFile = async (file: File, fileType: 'image' | 'video') => {
    const result = await uploadFileToCloudinary(file);
    if (fileType === 'image') {
      images.push({ url: result.secure_url, publicId: result.public_id });
    } else {
      videos.push({ url: result.secure_url, publicId: result.public_id });
    }
    uploadedFilesCount++;
    if (onOverallProgress) {
      onOverallProgress(Math.round((uploadedFilesCount / totalFiles) * 100));
    }
  };

  imageFiles.forEach(file => uploadPromises.push(uploadFile(file, 'image')));
  videoFiles.forEach(file => uploadPromises.push(uploadFile(file, 'video')));

  await Promise.all(uploadPromises);

  if (onUploadStartEnd) onUploadStartEnd(false);

  const newMemoryData: Partial<Omit<Memory, 'id'>> = {
    userId: user.uid,
    title,
    description,
    isPublic,
    createdAt: new Date(),
    tags,
    images,
    videos,
  };

  await addDoc(memoriesCollectionRef, newMemoryData as Omit<Memory, 'id'>);
};

export const updateMemory = async (
  id: string,
  title: string,
  description: string,
  isPublic: boolean,
  imageFiles: File[] | null,
  videoFiles: File[] | null,
  existingImages: Array<{ url?: string; publicId?: string }> = [],
  existingVideos: Array<{ url?: string; publicId?: string }> = [],
  tags: string[] = [],
  onOverallProgress?: (progress: number) => void,
  onUploadStartEnd?: (isUploading: boolean) => void
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const memoryRef = doc(db, 'memories', id);

  const newImages: { url: string; publicId: string }[] = [];
  const newVideos: { url: string; publicId: string }[] = [];

  const filesToUpload = [...(imageFiles || []), ...(videoFiles || [])];
  const totalFiles = filesToUpload.length;
  let uploadedFilesCount = 0;

  if (onUploadStartEnd) onUploadStartEnd(true);

  const uploadPromises: Promise<void>[] = [];

  const uploadFile = async (file: File, fileType: 'image' | 'video') => {
    const result = await uploadFileToCloudinary(file);
    if (fileType === 'image') {
      newImages.push({ url: result.secure_url, publicId: result.public_id });
    } else {
      newVideos.push({ url: result.secure_url, publicId: result.public_id });
    }
    uploadedFilesCount++;
    if (onOverallProgress) {
      onOverallProgress(Math.round((uploadedFilesCount / totalFiles) * 100));
    }
  };

  // Delete existing files if new ones are provided
  if (imageFiles) {
    for (const img of existingImages) {
      if (img.publicId) await deleteFileFromCloudinary(img.publicId);
    }
  } else {
    newImages.push(...(existingImages?.filter(img => img.url && img.publicId) as any[] || []));
  }

  if (videoFiles) {
    for (const vid of existingVideos) {
      if (vid.publicId) await deleteFileFromCloudinary(vid.publicId);
    }
  } else {
    newVideos.push(...(existingVideos?.filter(vid => vid.url && vid.publicId) as any[] || []));
  }

  filesToUpload.forEach(file => {
    if (imageFiles?.includes(file)) {
      uploadPromises.push(uploadFile(file, 'image'));
    } else if (videoFiles?.includes(file)) {
      uploadPromises.push(uploadFile(file, 'video'));
    }
  });

  await Promise.all(uploadPromises);

  if (onUploadStartEnd) onUploadStartEnd(false);

  const updatedData: Partial<Memory> = {
    title,
    description,
    isPublic,
    images: newImages,
    videos: newVideos,
    tags,
  };

  await updateDoc(memoryRef, updatedData);
};

export const getMemories = async (pageSize: number = 10, lastDoc?: any, searchQuery?: string, tagSearchQuery?: string): Promise<{ memories: Memory[]; lastVisible: any }> => {
  const user = auth.currentUser;
  if (!user) return { memories: [], lastVisible: null };

  let q: Query = query(
    memoriesCollectionRef,
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  );

  if (searchQuery) {
    q = query(q,
      where('title', '>=', searchQuery),
      where('title', '<=', searchQuery + '\uf8ff')
    );
  }

  if (tagSearchQuery) {
    q = query(q,
      where('tags', 'array-contains', tagSearchQuery)
    );
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  q = query(q, limit(pageSize));

  const querySnapshot = await getDocs(q);
  const memories = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data() as Omit<Memory, 'id'>,
    createdAt: doc.data().createdAt.toDate(),
  }));

  const lastVisible = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

  return { memories, lastVisible };
};

export const getPublicMemories = async (pageSize: number = 10, lastDoc?: any): Promise<{ memories: Memory[]; lastVisible: any }> => {
  let q = query(
    memoriesCollectionRef,
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const querySnapshot = await getDocs(q);
  const memories = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data() as Omit<Memory, 'id'>,
    createdAt: doc.data().createdAt.toDate(),
  }));

  const lastVisible = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

  return { memories, lastVisible };
};

export const deleteMemory = async (
  id: string,
  images?: Array<{ url: string; publicId: string }>,
  videos?: Array<{ url: string; publicId: string }>
) => {
  const memoryRef = doc(db, 'memories', id);

  try {
    const deletionPromises: Promise<any>[] = [];

    (images || []).forEach(img => {
      if (img.publicId) {
        deletionPromises.push(deleteFileFromCloudinary(img.publicId));
      }
    });

    (videos || []).forEach(vid => {
      if (vid.publicId) {
        deletionPromises.push(deleteFileFromCloudinary(vid.publicId));
      }
    });

    await Promise.all(deletionPromises);
    await deleteDoc(memoryRef);

  } catch (error) {
    console.error("Error deleting memory and associated files: ", error);
    throw new Error("Failed to delete memory.");
  }
};

export const toggleLike = async (memoryId: string, userId: string) => {
  const memoryRef = doc(db, 'memories', memoryId);
  const memorySnap = await getDoc(memoryRef);

  if (!memorySnap.exists()) {
    throw new Error('Memory not found');
  }

  const memoryData = memorySnap.data() as Memory;
  let currentLikes = memoryData.likes || [];

  if (currentLikes.includes(userId)) {
    currentLikes = currentLikes.filter(id => id !== userId);
  } else {
    currentLikes.push(userId);
  }

  await updateDoc(memoryRef, { likes: currentLikes });
};

export const addComment = async (memoryId: string, comment: MemoryComment) => {
  const memoryRef = doc(db, 'memories', memoryId);
  const memorySnap = await getDoc(memoryRef);

  if (!memorySnap.exists()) {
    throw new Error('Memory not found');
  }

  const memoryData = memorySnap.data() as Memory;
  const currentComments = memoryData.comments || [];

  await updateDoc(memoryRef, { comments: [...currentComments, comment] });
};

export const getAllMemoriesForAdmin = async (pageSize: number = 10, lastDoc?: any): Promise<{ memories: Memory[]; lastVisible: any }> => {
  let q = query(
    memoriesCollectionRef,
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const querySnapshot = await getDocs(q);
  const memories = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data() as Omit<Memory, 'id'>,
    createdAt: doc.data().createdAt.toDate(),
  }));

  const lastVisible = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

  return { memories, lastVisible };
};

export const getTotalMemoriesCount = async (): Promise<number> => {
  const querySnapshot = await getDocs(memoriesCollectionRef);
  return querySnapshot.size;
};

export const getAllUniqueTags = async (): Promise<{ tag: string; count: number }[]> => {
  const querySnapshot = await getDocs(memoriesCollectionRef);
  const tagCounts: { [key: string]: number } = {};
  querySnapshot.docs.forEach(doc => {
    const data = doc.data() as Memory;
    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};
