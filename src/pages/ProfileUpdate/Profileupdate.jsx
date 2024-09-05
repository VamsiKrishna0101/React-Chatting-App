import React, { useEffect, useState } from 'react';
import './Profileupdate.css';
import assets from '../../assets/assets';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';

const Profileupdate = () => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [image, setImage] = useState(null);
  const [prevImage, setPrevImage] = useState("");
  const navigate = useNavigate();

  const profileupdate = async (event) => {
    event.preventDefault();
    try {
      const docRef = doc(db, "users", uid);

      let imgurl = prevImage;
      if (image) {
        imgurl = await upload(image); // Wait for image upload to complete
        setPrevImage(imgurl); // Update the preview image URL after upload
      }

      await updateDoc(docRef, {
        avatar: imgurl,
        name: name,
        bio: bio
      });

      toast.success("Profile updated successfully");
      navigate('/chat')
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.name) setName(userData.name);
          if (userData.bio) setBio(userData.bio);
          if (userData.avatar) setPrevImage(userData.avatar);
        }
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileupdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input 
              onChange={(e) => setImage(e.target.files[0])} 
              type="file" 
              id="avatar" 
              accept='.jpg,.png,.jpeg' 
              hidden 
            />
            <img 
              className='profile-myimg' 
              src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon} 
              alt="Profile" 
            />
            Upload Profile Image
          </label>
          <input 
            onChange={(e) => setName(e.target.value)} 
            value={name} 
            type="text" 
            placeholder='Enter your name' 
            required 
          />
          <textarea 
            onChange={(e) => setBio(e.target.value)} 
            value={bio} 
            placeholder='Enter Your Bio' 
            required 
          ></textarea>
          <button type='submit'>Save</button>
        </form>
        <img 
          className='profile-pic' 
          src={prevImage || assets.logo_icon} 
          alt="Profile Preview" 
        />
      </div>
    </div>
  );
};

export default Profileupdate;
