import React, { useContext, useEffect, useState } from "react";
import "./Chat.css";
import Leftside from "../../components/Leftside/Leftside";
import ChatBox from "../../components/ChatBox/ChatBox";
import RightSide from "../../components/RightSide/RightSide";
import { AppContext } from "../../context/AppContext";
const Chat = () => {
  const { userdata, chatdata } = useContext(AppContext);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    if (userdata && chatdata) {
      setloading(false)
    }
  }, [chatdata, userdata]);
  return (
    <div className="chat">
      {loading ? (
        <p className="loading">
          Loading
        </p>
      ) : (
        <div className="chat-container">
          <Leftside />
          <ChatBox />
          <RightSide />
        </div>
      )}
    </div>
  );
};

export default Chat;
