import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "../config/firebase.js";

// User operations
export const userOperations = {
  // Create a new user
  async create(userData) {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...userData };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  },

  // Find user by email
  async findByEmail(email) {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  },

  // Find user by username
  async findByUsername(username) {
    try {
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  },

  // Find user by ID
  async findById(id) {
    try {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  },

  // Update user
  async update(id, updateData) {
    try {
      const docRef = doc(db, "users", id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date()
      });
      return { id, ...updateData };
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }
};

// Post operations
export const postOperations = {
  // Create a new post
  async create(postData) {
    try {
      const docRef = await addDoc(collection(db, "posts"), {
        ...postData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...postData };
    } catch (error) {
      throw new Error(`Error creating post: ${error.message}`);
    }
  },

  // Find post by ID
  async findById(id) {
    try {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      throw new Error(`Error finding post by ID: ${error.message}`);
    }
  },

  // Get all posts
  async findAll() {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching posts: ${error.message}`);
    }
  },

  // Search posts by category
  async findByCategory(category) {
    try {
      const q = query(
        collection(db, "posts"), 
        where("category", "==", category.toUpperCase()),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error searching posts by category: ${error.message}`);
    }
  },

  // Update post
  async update(id, updateData) {
    try {
      const docRef = doc(db, "posts", id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date()
      });
      return { id, ...updateData };
    } catch (error) {
      throw new Error(`Error updating post: ${error.message}`);
    }
  },

  // Delete post
  async delete(id) {
    try {
      const docRef = doc(db, "posts", id);
      await deleteDoc(docRef);
      return { id };
    } catch (error) {
      throw new Error(`Error deleting post: ${error.message}`);
    }
  }
};

// Follow operations
export const followOperations = {
  // Create a follow relationship
  async create(followData) {
    try {
      const docRef = await addDoc(collection(db, "follows"), {
        ...followData,
        createdAt: new Date()
      });
      return { id: docRef.id, ...followData };
    } catch (error) {
      throw new Error(`Error creating follow: ${error.message}`);
    }
  },

  // Check if user is following another user
  async findFollowRelation(followerId, followingId) {
    try {
      const q = query(
        collection(db, "follows"), 
        where("followerId", "==", followerId),
        where("followingId", "==", followingId)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error finding follow relation: ${error.message}`);
    }
  },

  // Get users following a specific user
  async getFollowing(userId) {
    try {
      const q = query(collection(db, "follows"), where("followerId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching following users: ${error.message}`);
    }
  },

  // Delete follow relationship
  async delete(followerId, followingId) {
    try {
      const q = query(
        collection(db, "follows"), 
        where("followerId", "==", followerId),
        where("followingId", "==", followingId)
      );
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting follow relation: ${error.message}`);
    }
  }
};
