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
} from 'firebase/firestore';

import { Memory } from '@/types/memory';

// Referência à coleção
const memoriesCollectionRef = collection(db, 'memories');

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

// 📤 Upload de arquivo para Cloudinary
const uploadFileToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload-cloudinary', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload file to Cloudinary');
  }

  return response.json();
};

// 🗑️ Remoção de arquivo do Cloudinary
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

// ✅ 1. Adicionar nova memória
export const addMemory = async (
  title: string,
  description?: string,
  isPublic?: boolean,
  imageFiles?: File[],
  videoFiles?: File[]
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const images: { url: string; publicId: string }[] = [];
  const videos: { url: string; publicId: string }[] = [];

  // Upload de imagens
  if (imageFiles?.length) {
    for (const file of imageFiles) {
      const result = await uploadFileToCloudinary(file);
      images.push({ url: result.secure_url, publicId: result.public_id });
    }
  }

  // Upload de vídeos
  if (videoFiles?.length) {
    for (const file of videoFiles) {
      const result = await uploadFileToCloudinary(file);
      videos.push({ url: result.secure_url, publicId: result.public_id });
    }
  }

  // Dados a serem salvos no Firestore
  const newMemoryData: Partial<Omit<Memory, 'id'>> = {
    userId: user.uid,
    title,
    description,
    isPublic: isPublic || false,
    createdAt: new Date(),
  };

  if (images.length > 0) newMemoryData.images = images;
  if (videos.length > 0) newMemoryData.videos = videos;

  await addDoc(memoriesCollectionRef, newMemoryData as Omit<Memory, 'id'>);
};

// ✅ 2. Obter todas memórias do utilizador autenticado
export const getMemories = async (pageSize: number = 10, lastDoc?: any, searchQuery?: string): Promise<{ memories: Memory[]; lastVisible: any }> => {
  const user = auth.currentUser;
  if (!user) return { memories: [], lastVisible: null };

  let q = query(
    memoriesCollectionRef,
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  );

  if (searchQuery) {
    // For basic search, we can filter by title. Firestore doesn't support full-text search directly.
    // For more advanced search, consider a dedicated search service like Algolia or ElasticSearch.
    q = query(q,
      where('title', '>=', searchQuery),
      where('title', '<=', searchQuery + '\uf8ff')
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

// ✅ 3. Atualizar memória existente
export const updateMemory = async (
  id: string,
  title: string,
  description: string,
  isPublic: boolean,
  imageFiles?: File[] | null,
  videoFiles?: File[] | null,
  existingImages?: Array<{ url?: string; publicId?: string }>,
  existingVideos?: Array<{ url?: string; publicId?: string }>
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const memoryRef = doc(db, 'memories', id);

  const newImages: { url: string; publicId: string }[] = [];
  const newVideos: { url: string; publicId: string }[] = [];

  // Handle image updates
  if (imageFiles) {
    // Delete old images
    for (const img of existingImages || []) {
      if (img.publicId) await deleteFileFromCloudinary(img.publicId);
    }
    // Upload new images
    for (const file of imageFiles) {
      const result = await uploadFileToCloudinary(file);
      newImages.push({ url: result.secure_url, publicId: result.public_id });
    }
  } else {
    newImages.push(...(existingImages?.filter(img => img.url && img.publicId) as any[] || []));
  }

  // Handle video updates
  if (videoFiles) {
    // Delete old videos
    for (const vid of existingVideos || []) {
      if (vid.publicId) await deleteFileFromCloudinary(vid.publicId);
    }
    // Upload new videos
    for (const file of videoFiles) {
      const result = await uploadFileToCloudinary(file);
      newVideos.push({ url: result.secure_url, publicId: result.public_id });
    }
  } else {
    newVideos.push(...(existingVideos?.filter(vid => vid.url && vid.publicId) as any[] || []));
  }

  const updatedData: Partial<Memory> = {
    title,
    description,
    isPublic,
    images: newImages,
    videos: newVideos,
  };

  await updateDoc(memoryRef, updatedData);
};

// ✅ 4. Deletar memória e arquivos associados
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
    // Optionally re-throw the error or handle it as needed
    throw new Error("Failed to delete memory.");
  }
};
