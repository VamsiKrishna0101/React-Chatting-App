import React, { useContext, useState } from "react";
import "./Leftside.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";

const Leftside = () => {
  const navigate = useNavigate();
  const { userdata, chatdata,messageId,setmessageId,chatuser,setchatuser} = useContext(AppContext);
  const [user, setuser] = useState(null);
  const [showsearch, setshowsearch] = useState(false);

  const inputhandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setshowsearch(true);
        const userref = collection(db, "users");
        const q = query(userref, where("username", "==", input.toLowerCase()));
        const querysnap = await getDocs(q);

        if (!querysnap.empty) {
          const fetchedUser = querysnap.docs[0].data();
          let userexists = false;

          if (chatdata && Array.isArray(chatdata)) {
            chatdata.forEach((chat) => {
              if (chat.rId === fetchedUser.id) {
                userexists = true;
              }
            });
          }

          if (fetchedUser.id !== userdata.id && !userexists) {
            setuser(fetchedUser);
          } else {
            setuser(null);
          }
        } else {
          setuser(null);
        }
      } else {
        setshowsearch(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const setchat=async(item)=>{
    setmessageId(item.messageId)
    setchatuser(item)
  }
  const addchat = async () => {
    const messageRef = collection(db, "messages");
    const chatRef = collection(db, "chats");
  
    try {
      if (user && user.id && userdata && userdata.id) {
        // Create a new message document
        const newmessageref = doc(messageRef);
        await setDoc(newmessageref, {
          createdAt: serverTimestamp(),
          messages: [],
        });
  
        // Update the chat document for the user being added
        const userChatRef = doc(chatRef, user.id);
        await updateDoc(userChatRef, {
          chatData: arrayUnion({
            messageId: newmessageref.id,
            lastMessage: "",
            rId: userdata.id,
            updatedNow: Date.now(),
            messageSeen: true,
          }),
        });
  
        // Update the chat document for the current user
        const userdataChatRef = doc(chatRef, userdata.id);
        await updateDoc(userdataChatRef, {
          chatData: arrayUnion({
            messageId: newmessageref.id,
            lastMessage: "",
            rId: user.id,
            updatedNow: Date.now(),
            messageSeen: true,
          }),
        });
      } else {
        console.error("User ID or Userdata ID is undefined.");
      }
    } catch (error) {
      console.error("Error adding chat:", error);
    }
  };
  
  return (
    <div className="left">
      <div className="left-top">
        <div className="left-nav">
          <img src={assets.logo} className="mylogo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" className="search-logo" />
            <div className="menu-list">
              <p onClick={() => navigate("/profile")}>Edit profile</p>
              <hr />
              <p onClick={() => navigate("/")}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <input type="text" placeholder="Search Here" onChange={inputhandler} />
          <img src={assets.search_icon} alt="" />
        </div>
      </div>
      <div className="ls-list">
        {showsearch && user ? (
          <div onClick={addchat} className="frnds-list add-user">
            <img src={user.avatar} alt="" className="profile-logo" />
            <div>
              <p>{user.name}</p>
              <span>{user.username}</span>
            </div>
          </div>
        ) : (
          chatdata && Array.isArray(chatdata) ? (
            chatdata.map((item, index) => (
              <div onClick={()=>setchat(item)} className="frnds-list" key={index}>
                <img src={item.userdata.avatar} className="profile-logo" />
                <div>
                  <p>{item.userdata.name}</p>
                  <span>{item.lastMessage}</span>
                </div>
              </div>
            ))
          ) : (
            <div>No chats available</div>
          )
        )}
      </div>
    </div>
  );
};

export default Leftside;
