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

const memoriesCollectionRef = collection(db, 'memories');

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

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

const deleteFileFromCloudinary = async (publicId: string) => {
  const response = await fetch('/api/upload-cloudinary', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
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
  description: string,
  imageFile?: File,
  videoFile?: File
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  let imageUrl: string | undefined;
  let imagePublicId: string | undefined;
  let videoUrl: string | undefined;
  let videoPublicId: string | undefined;

  if (imageFile) {
    const result = await uploadFileToCloudinary(imageFile);
    imageUrl = result.secure_url;
    imagePublicId = result.public_id;
  }
  if (videoFile) {
    const result = await uploadFileToCloudinary(videoFile);
    videoUrl = result.secure_url;
    videoPublicId = result.public_id;
  }

  const newMemory: Omit<Memory, 'id'> = {
    userId: user.uid,
    title,
    description,
    createdAt: new Date(),
    ...(imageUrl && { imageUrl }),
    ...(imagePublicId && { imagePublicId }),
    ...(videoUrl && { videoUrl }),
    ...(videoPublicId && { videoPublicId }),
  };

  await addDoc(memoriesCollectionRef, newMemory);
};

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
    ...(doc.data() as Omit<Memory, 'id'>),
  }));
};

export const updateMemory = async (
  id: string,
  title: string,
  description: string,
  imageFile?: File,
  videoFile?: File,
  currentImageUrl?: string,
  currentImagePublicId?: string,
  currentVideoUrl?: string,
  currentVideoPublicId?: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const memoryRef = doc(db, 'memories', id);
  let imageUrl: string | undefined = currentImageUrl;
  let imagePublicId: string | undefined = currentImagePublicId;
  let videoUrl: string | undefined = currentVideoUrl;
  let videoPublicId: string | undefined = currentVideoPublicId;

  // Handle image update
  if (imageFile) {
    if (currentImagePublicId) await deleteFileFromCloudinary(currentImagePublicId);
    const result = await uploadFileToCloudinary(imageFile);
    imageUrl = result.secure_url;
    imagePublicId = result.public_id;
  } else if (imageFile === null && currentImagePublicId) {
    // If imageFile is explicitly set to null (e.g., user cleared the input), delete the old image
    imageUrl = undefined;
    imagePublicId = undefined;
    await deleteFileFromCloudinary(currentImagePublicId);
  }

  // Handle video update
  if (videoFile) {
    if (currentVideoPublicId) await deleteFileFromCloudinary(currentVideoPublicId);
    const result = await uploadFileToCloudinary(videoFile);
    videoUrl = result.secure_url;
    videoPublicId = result.public_id;
  } else if (videoFile === null && currentVideoPublicId) {
    // If videoFile is explicitly set to null, delete the old video
    videoUrl = undefined;
    videoPublicId = undefined;
    await deleteFileFromCloudinary(currentVideoPublicId);
  }

  const updatedData: Partial<Memory> = {
    title,
    description,
    ...(imageUrl !== undefined && { imageUrl }),
    ...(imagePublicId !== undefined && { imagePublicId }),
    ...(videoUrl !== undefined && { videoUrl }),
    ...(videoPublicId !== undefined && { videoPublicId }),
  };

  await updateDoc(memoryRef, updatedData);
};

export const deleteMemory = async (id: string, imageUrl?: string, videoUrl?: string, imagePublicId?: string, videoPublicId?: string) => {
  const memoryRef = doc(db, 'memories', id);
  if (imagePublicId) await deleteFileFromCloudinary(imagePublicId);
  if (videoPublicId) await deleteFileFromCloudinary(videoPublicId);
  await deleteDoc(memoryRef);
};