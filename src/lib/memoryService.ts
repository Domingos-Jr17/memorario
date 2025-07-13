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
    createdAt: new Date(),
  };

  if (images.length > 0) newMemoryData.images = images;
  if (videos.length > 0) newMemoryData.videos = videos;

  await addDoc(memoriesCollectionRef, newMemoryData as Omit<Memory, 'id'>);
};

// ✅ 2. Obter todas memórias do utilizador autenticado
export const getMemories = async (): Promise<Memory[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    memoriesCollectionRef,
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data() as Omit<Memory, 'id'>,
    createdAt: doc.data().createdAt.toDate(), // Converter Timestamp para Date
  }));
};

// ✅ 3. Atualizar memória existente
export const updateMemory = async (
  id: string,
  title: string,
  description: string,
  imageFiles?: File[] | null,
  videoFiles?: File[] | null,
  existingImages?: Array<{ url?: string; publicId?: string }>,
  existingVideos?: Array<{ url?: string; publicId?: string }>
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const memoryRef = doc(db, 'memories', id);

  let images: { url: string; publicId: string }[] = existingImages?.filter(img => img.url && img.publicId) as any[] || [];
  let videos: { url: string; publicId: string }[] = existingVideos?.filter(vid => vid.url && vid.publicId) as any[] || [];

  // Substituir imagens
  if (imageFiles?.length) {
    for (const img of images) {
      if (img.publicId) await deleteFileFromCloudinary(img.publicId);
    }
    images = [];
    for (const file of imageFiles) {
      const result = await uploadFileToCloudinary(file);
      images.push({ url: result.secure_url, publicId: result.public_id });
    }
  } else if (imageFiles === null) {
    for (const img of images) {
      if (img.publicId) await deleteFileFromCloudinary(img.publicId);
    }
    images = [];
  }

  // Substituir vídeos
  if (videoFiles?.length) {
    for (const vid of videos) {
      if (vid.publicId) await deleteFileFromCloudinary(vid.publicId);
    }
    videos = [];
    for (const file of videoFiles) {
      const result = await uploadFileToCloudinary(file);
      videos.push({ url: result.secure_url, publicId: result.public_id });
    }
  } else if (videoFiles === null) {
    for (const vid of videos) {
      if (vid.publicId) await deleteFileFromCloudinary(vid.publicId);
    }
    videos = [];
  }

  const updatedData: Partial<Memory> = {
    title,
    description,
  };

  if (images.length > 0) updatedData.images = images;
  if (videos.length > 0) updatedData.videos = videos;

  await updateDoc(memoryRef, updatedData);
};

// ✅ 4. Deletar memória e arquivos associados
export const deleteMemory = async (
  id: string,
  images?: Array<{ url: string; publicId: string }>,
  videos?: Array<{ url: string; publicId: string }>
) => {
  const memoryRef = doc(db, 'memories', id);

  for (const img of images || []) {
    await deleteFileFromCloudinary(img.publicId);
  }

  for (const vid of videos || []) {
    await deleteFileFromCloudinary(vid.publicId);
  }

  await deleteDoc(memoryRef);
};
