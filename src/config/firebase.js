import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVNzcmc5MA6WAxTmPg5kYzEBfX5Mxfx6c",
  authDomain: "letschat-8d6f9.firebaseapp.com",
  projectId: "letschat-8d6f9",
  storageBucket: "letschat-8d6f9.appspot.com",
  messagingSenderId: "146681810220",
  appId: "1:146681810220:web:6165b5d86231e1698eb089",
  measurementId: "G-BGQCPLWBNC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Signup function
const signup = async (username, email, password) => {
  try {
    console.log("Signing up...");
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    console.log("User created:", user);

    // Add user document to Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email: email,
      name: "",
      avatar: "",
      bio: "Hey there! I am using Chat App",
      lastseen: Date.now(),
    });
    console.log("User document set");

    // Initialize chat document for the user
    await setDoc(doc(db, "chats", user.uid), {
      chatData: []
    });
    console.log("Chat document set");
    toast.success("Signup successful!");
  } catch (error) {
    console.error("Error during signup:", error);
    toast.error(error.code.split("/")[1].split('-').join(" "));

  }
};
const login=async(email,password)=>{
 try {
    await signInWithEmailAndPassword(auth,email,password)
 } catch (error) {
    console.error("Error during login:", error);
    toast.error(error.code.split("/")[1].split('-').join(" "));
 }
}
const logout=async()=>{
    try {
        await signOut(auth)
    } catch (error) {
        toast.error(error.code.split("/")[1].split('-').join(" "));
    }
}
export { signup,login,logout,auth,db};
