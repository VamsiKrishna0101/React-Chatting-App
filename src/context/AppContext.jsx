import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Create the context
export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [userdata, setuserdata] = useState(null);
  const [chatdata, setchatdata] = useState([]);
  const navigate = useNavigate();
  const[messageId,setmessageId]=useState(null)
  const[messages,setmessages]=useState([])
  const[chatuser,setchatuser]=useState(null)

  // Function to load user data
  const loaduserdata = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const usersnap = await getDoc(userRef);

      if (usersnap.exists()) {
        const Userdata = usersnap.data();
        setuserdata(Userdata); // Set the userdata state
        if (Userdata.avatar && Userdata.name) {
          navigate("/chat");
        } else {
          navigate("/profile");
        }
        await updateDoc(userRef, {
          lastseen: Date.now(),
        });
        setInterval(async () => {
          if (auth.charUser) {
            await updateDoc(userRef, {
              lastseen: Date.now(),
            });
          }
        }, 6000);
      } else {
        console.log("No such user document exists!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (userdata) {
      const chatRef = doc(db, 'chats', userdata.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        const chatitems = res.data()?.chatData || [];
        console.log(chatitems);

        const tempdata = [];
        for (const item of chatitems) {
          const userref = doc(db, 'users', item.rId);
          const usersnap = await getDoc(userref);
          const userdata = usersnap.data();
          if (userdata) {
            tempdata.push({ ...item, userdata });
          }
        }
        setchatdata(tempdata.sort((a, b) => b.updatedAt - a.updatedAt));
      });

      return () => unSub(); // Clean up the subscription on unmount
    }
  }, [userdata]);

  const value = {
    userdata,
    setuserdata,
    chatdata,
    setchatdata,
    loaduserdata,
    messageId,setmessageId,
    messages,setmessages,
    chatuser,setchatuser
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
