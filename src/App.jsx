import React, { useContext, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Chat from './pages/Chat/Chat';
import Profileupdate from './pages/ProfileUpdate/Profileupdate';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { AppContext } from './context/AppContext';

const App = () => {
  const navigate = useNavigate();
  const { loaduserdata } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        navigate('/chat');
        await loaduserdata(user.uid); // Corrected user ID reference
      } else {
        navigate("/");
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profileupdate />} />
      </Routes>
    </>
  );
};

export default App;
