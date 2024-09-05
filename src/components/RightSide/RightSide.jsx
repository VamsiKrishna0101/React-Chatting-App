import React from "react";
import "./RightSide.css";
import assets from "../../assets/assets";
import { logout } from "../../config/firebase";
const RightSide = () => {
  return (
    <div className="rs">
      <div className="rs-profile">
        <img src={assets.disha1} alt="" />
        <h3>Vamsi Krishna</h3>
        <p>hey There I Am using Chatting App Connect now</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" />
          <img src={assets.pic4} alt="" />
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
        </div>
      </div>
      <button onClick={()=>logout()} className="rs-button">Logout</button>
    </div>
  );
};

export default RightSide;
