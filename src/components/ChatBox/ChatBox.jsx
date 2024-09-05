import React, { useContext, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
const ChatBox = () => {
  const{chatuser,userdata,messageId,messages,setmessages}=useContext(AppContext)
  const[input,setinput]=useState("")
  return chatuser?(
    <div className='chatbox'>
    <div className="chat-user">
      <img src={chatuser.userdata.avatar} alt="" />
      <p>{chatuser.userdata.name} <img src={assets.green_dot} className='dot'/></p>
      <img src={assets.help_icon} alt="" />
    </div>

    <div className="chat-msg">
      <div className="s-msg">
        <p className='msg'>Hello How Long Have You Been here Boi</p>
        <div>
          <img src={assets.disha1} />
          <p>2:30 PM</p>
        </div>
      </div>
      <div className="s-msg">
        <img className='msg-img' src={assets.pic1} alt="" />
        <div>
          <img src={assets.disha1} />
          <p>2:30 PM</p>
        </div>
      </div>
      <div className="r-msg">
        <img className='msg-img' src={assets.pic1} alt="" />
        <div>
          <img src={assets.disha1} />
          <p>2:30 PM</p>
        </div>
      </div>
      <div className="r-msg">
        <p className='msg'>Hello How Long Have You Been here Boi</p>
        <div>
          <img src={assets.disha1} />
          <p>2:30 PM</p>
        </div>
      </div>
    </div>

     <div className="chat-input">
      <input type="text" placeholder='Send A Message' />
      <input type="file" id='image' accept='image/png, image/jpeg'hidden />
      <label htmlFor="image">
        <img src={assets.gallery_icon}  />
      </label>
      <img src={assets.send_button}  />
     </div>
  </div>
  ):<div className='chat-welcome'>
    <img src={assets.logo_icon} alt="" />
    <p>Chat Anytime,AnyWhere</p>
  </div>
}

export default ChatBox