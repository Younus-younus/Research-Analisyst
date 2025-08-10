// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { fileToBase64, uploadToCloudinary, validateFile } from '../utils/freeStorage';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase services (removed storage)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
// Auth functions
export const registerUser = async (email: string, password: string, userData: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Upload profile photo using Cloudinary
    let photoURL = '';
    if (userData.profilePhoto) {
      // Validate file first
      const validation = validateFile(userData.profilePhoto, 'image');
      if (!validation.valid) {
        throw new Error(`Profile photo error: ${validation.error}`);
      }
      try {
        photoURL = await uploadToCloudinary(userData.profilePhoto, 'image');
      } catch (error) {
        console.warn('Cloudinary upload failed:', error);
        // Fallback to base64 for small images only
        if (userData.profilePhoto.size < 100 * 1024) { // 100KB limit for fallback
          photoURL = await fileToBase64(userData.profilePhoto);
        } else {
          throw new Error('Profile photo upload failed. Please try a smaller image (< 10MB).');
        }
      }
    }
    // Update user profile
    await updateProfile(user, {
      displayName: userData.username,
      photoURL: photoURL
    });
    // Store additional user data in Firestore using user's UID as document ID
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      username: userData.username,
      fullName: userData.fullName,
      institution: userData.institution,
      fieldOfStudy: userData.fieldOfStudy,
      photoURL: photoURL,
      createdAt: serverTimestamp()
    });
    return user;
  } catch (error: any) {
    console.error('Registration error:', error);
    // Handle specific Firebase errors
    if (error.code === 'permission-denied') {
      throw new Error('Database permission denied. Please check Firestore security rules.');
    } else if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please use a different email or try logging in.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    }
    throw error;
  }
};
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Login error:', error.code, error.message);
    throw error;
  }
};
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};
// Get user data by UID
export const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};
// Research post functions
export const createResearchPost = async (postData: any, file?: File) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    let documentURL = '';
    let documentName = '';
    let documentSize = 0;
    if (file) {
      documentName = file.name;
      documentSize = file.size;
      // Validate file first
      const validation = validateFile(file, 'document');
      if (!validation.valid) {
        throw new Error(`Document error: ${validation.error}`);
      }
      try {
        // Upload document to Cloudinary (supports up to 50MB)
        documentURL = await uploadToCloudinary(file, 'raw');
      } catch (error) {
        console.warn('Cloudinary document upload failed:', error);
        // For files larger than 10MB, suggest external hosting
        if (file.size > 10 * 1024 * 1024) { // 10MB
          throw new Error(`File "${file.name}" is too large (${Math.round(file.size / 1024 / 1024)}MB). Please upload it to Google Drive, Dropbox, or GitHub and include the sharing link in your research content.`);
        }
        // For smaller files, try base64 as fallback
        if (file.size <= 1024 * 1024) { // 1MB or less
          documentURL = await fileToBase64(file);
        } else {
          throw new Error('Document upload failed. Please try again or use a smaller file.');
        }
      }
    }

    const docRef = await addDoc(collection(db, 'researches'), {
      title: postData.title,
      content: postData.content,
      category: postData.category,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      authorPhoto: user.photoURL || '',
      documentURL: documentURL,
      documentName: documentName,
      documentSize: documentSize,
      createdAt: serverTimestamp(),
      likes: 0,
      views: 0
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};
export const getAllResearches = async () => {
  try {
    const q = query(collection(db, 'researches'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const researches: any[] = [];
    querySnapshot.forEach((doc) => {
      researches.push({ id: doc.id, ...doc.data() });
    });
    return researches;
  } catch (error) {
    throw error;
  }
};
export const getResearchesByCategory = async (category: string) => {
  try {
    const q = query(
      collection(db, 'researches'), 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const researches: any[] = [];
    querySnapshot.forEach((doc) => {
      researches.push({ id: doc.id, ...doc.data() });
    });
    return researches;
  } catch (error) {
    throw error;
  }
};
export const getUserResearches = async (userId: string) => {
  try {
    // Temporary: Remove orderBy to avoid index requirement
    // Once you create the composite index, you can add back: orderBy('createdAt', 'desc')
    const q = query(
      collection(db, 'researches'), 
      where('authorId', '==', userId)
      // orderBy('createdAt', 'desc') // Commented out until index is created
    );
    const querySnapshot = await getDocs(q);
    const researches: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      researches.push({ id: doc.id, ...data });
    });
    // Sort manually for now (since we can't use orderBy without index)
    researches.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime; // Descending order (newest first)
    });
    return researches;
  } catch (error) {
    console.error('Error in getUserResearches:', error);
    throw error;
  }
};
export const getResearchById = async (id: string) => {
  try {
    const docRef = doc(db, 'researches', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as any;
    } else {
      throw new Error('Research not found');
    }
  } catch (error) {
    throw error;
  }
};
export const searchResearches = async (searchTerm: string) => {
  try {
    const q = query(collection(db, 'researches'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const researches: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.category.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        researches.push({ id: doc.id, ...data });
      }
    });
    return researches;
  } catch (error) {
    throw error;
  }
};

// Comment functions
export const addComment = async (researchId: string, content: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const docRef = await addDoc(collection(db, 'comments'), {
      researchId,
      content: content.trim(),
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      authorPhoto: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getCommentsByResearchId = async (researchId: string) => {
  try {
    // Temporary: Remove orderBy to avoid index requirement
    // Once you create the composite index, you can add back: orderBy('createdAt', 'desc')
    const q = query(
      collection(db, 'comments'),
      where('researchId', '==', researchId)
      // orderBy('createdAt', 'desc') // Commented out until index is created
    );
    const querySnapshot = await getDocs(q);
    const comments: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({ id: doc.id, ...data });
    });
    
    // Sort manually for now (since we can't use orderBy without index)
    comments.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime; // Descending order (newest first)
    });
    
    return comments;
  } catch (error) {
    throw error;
  }
};

export const deleteComment = async (commentId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // First check if the user owns this comment
    const commentDoc = await getDoc(doc(db, 'comments', commentId));
    if (!commentDoc.exists()) {
      throw new Error('Comment not found');
    }

    const commentData = commentDoc.data();
    if (commentData.authorId !== user.uid) {
      throw new Error('You can only delete your own comments');
    }

    await deleteDoc(doc(db, 'comments', commentId));
    return true;
  } catch (error) {
    throw error;
  }
};

// Save/Bookmark functions
export const saveResearch = async (userId: string, researchId: string) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) throw new Error('User not authenticated');

    // Check if already saved to avoid duplicates
    const existingSave = await checkIfResearchSaved(userId, researchId);
    if (existingSave) {
      throw new Error('Research is already saved');
    }

    const docRef = await addDoc(collection(db, 'savedResearches'), {
      researchId,
      userId,
      savedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const unsaveResearch = async (userId: string, researchId: string) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) throw new Error('User not authenticated');

    // Find the saved research document
    const q = query(
      collection(db, 'savedResearches'),
      where('researchId', '==', researchId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('Research is not saved');
    }

    // Delete the saved research document
    const docToDelete = querySnapshot.docs[0];
    await deleteDoc(doc(db, 'savedResearches', docToDelete.id));
    
    return true;
  } catch (error) {
    throw error;
  }
};

export const checkIfResearchSaved = async (userId: string, researchId: string) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) return false;

    const q = query(
      collection(db, 'savedResearches'),
      where('researchId', '==', researchId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking saved status:', error);
    return false;
  }
};

export const getSavedResearches = async (userId: string) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) throw new Error('User not authenticated');

    // Get saved research IDs (temporarily without ordering until Firebase index is created)
    const q = query(
      collection(db, 'savedResearches'),
      where('userId', '==', userId)
      // orderBy('savedAt', 'desc') // Commented out until Firebase composite index is created
    );
    
    const querySnapshot = await getDocs(q);
    const savedResearchData: Array<{researchId: string, savedAt: any}> = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      savedResearchData.push({
        researchId: data.researchId,
        savedAt: data.savedAt
      });
    });

    // Sort manually by savedAt (most recent first)
    savedResearchData.sort((a, b) => {
      if (!a.savedAt || !b.savedAt) return 0;
      return b.savedAt.toDate() - a.savedAt.toDate();
    });

    // Extract research IDs in sorted order
    const savedResearchIds = savedResearchData.map(item => item.researchId);

    // If no saved researches, return empty array
    if (savedResearchIds.length === 0) {
      return [];
    }

    // Get the actual research documents
    const researches: any[] = [];
    for (const researchId of savedResearchIds) {
      try {
        const researchDoc = await getDoc(doc(db, 'researches', researchId));
        if (researchDoc.exists()) {
          researches.push({ id: researchDoc.id, ...researchDoc.data() });
        }
      } catch (error) {
        console.error(`Error fetching research ${researchId}:`, error);
        // Continue with other researches if one fails
      }
    }

    return researches;
  } catch (error) {
    throw error;
  }
};

export default app;
