// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, where } from "firebase/firestore";

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

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Free image upload service using ImgBB
const uploadImageToImgBB = async (imageFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    // Using ImgBB free API
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error('ImgBB API key not configured');
    }
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('Failed to upload image');
    }
  } catch (error) {
    // Fallback: convert to base64 (not recommended for large images)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(imageFile);
    });
  }
};

// Alternative: Convert file to base64 for small documents
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Auth functions
export const registerUser = async (email: string, password: string, userData: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Upload profile photo using free service
    let photoURL = '';
    if (userData.profilePhoto) {
      photoURL = await uploadImageToImgBB(userData.profilePhoto);
    }
    
    // Update user profile
    await updateProfile(user, {
      displayName: userData.username,
      photoURL: photoURL
    });
    
    // Store additional user data in Firestore
    await addDoc(collection(db, 'users'), {
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
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
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

// Research post functions
export const createResearchPost = async (postData: any, file?: File) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    let documentData = '';
    let documentType = '';
    let documentName = '';
    
    if (file) {
      // For small files (< 1MB), convert to base64 and store in Firestore
      if (file.size < 1024 * 1024) {
        documentData = await fileToBase64(file);
        documentType = file.type;
        documentName = file.name;
      } else {
        // For larger files, suggest external hosting
        throw new Error('File too large. Please upload to Google Drive, Dropbox, or similar service and provide the link in the content.');
      }
    }
    
    const docRef = await addDoc(collection(db, 'researches'), {
      title: postData.title,
      content: postData.content,
      category: postData.category,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      authorPhoto: user.photoURL || '',
      documentData: documentData, // Base64 data for small files
      documentType: documentType,
      documentName: documentName,
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
    const q = query(
      collection(db, 'researches'), 
      where('authorId', '==', userId),
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

export default app;
