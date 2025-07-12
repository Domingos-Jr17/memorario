import { db, storage, auth } from './firebase';
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Memory } from '@/types/memory';

const memoriesCollectionRef = collection(db, 'memories');

const uploadFile = async (file: File, userId: string, type: 'image' | 'video') => {
  const fileRef = ref(storage, `${userId}/${type}s/${file.name}_${Date.now()}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
};

const deleteFile = async (url: string) => {
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
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
  let videoUrl: string | undefined;

  if (imageFile) {
    imageUrl = await uploadFile(imageFile, user.uid, 'image');
  }
  if (videoFile) {
    videoUrl = await uploadFile(videoFile, user.uid, 'video');
  }

  const newMemory: Omit<Memory, 'id'> = {
    userId: user.uid,
    title,
    description,
    createdAt: new Date(),
    ...(imageUrl && { imageUrl }),
    ...(videoUrl && { videoUrl }),
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
  currentVideoUrl?: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const memoryRef = doc(db, 'memories', id);
  let imageUrl: string | undefined = currentImageUrl;
  let videoUrl: string | undefined = currentVideoUrl;

  if (imageFile) {
    if (currentImageUrl) await deleteFile(currentImageUrl);
    imageUrl = await uploadFile(imageFile, user.uid, 'image');
  } else if (currentImageUrl && !imageFile) {
    // If image was removed
    imageUrl = undefined;
    await deleteFile(currentImageUrl);
  }

  if (videoFile) {
    if (currentVideoUrl) await deleteFile(currentVideoUrl);
    videoUrl = await uploadFile(videoFile, user.uid, 'video');
  } else if (currentVideoUrl && !videoFile) {
    // If video was removed
    videoUrl = undefined;
    await deleteFile(currentVideoUrl);
  }

  const updatedData: Partial<Memory> = {
    title,
    description,
    ...(imageUrl !== undefined && { imageUrl }),
    ...(videoUrl !== undefined && { videoUrl }),
  };

  await updateDoc(memoryRef, updatedData);
};

export const deleteMemory = async (id: string, imageUrl?: string, videoUrl?: string) => {
  const memoryRef = doc(db, 'memories', id);
  if (imageUrl) await deleteFile(imageUrl);
  if (videoUrl) await deleteFile(videoUrl);
  await deleteDoc(memoryRef);
};
