import React, { useState } from 'react';
import './Login.css';
import assets from '../../assets/assets';
import { signup,login} from '../../config/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [currstate, setcurrstate] = useState("SignUp");
  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  // Handle form submission
  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currstate === "SignUp") {
      if (username && email && password) {
        signup(username, email, password);
      } else {
        toast.error("Please fill in all fields");
      }
    }else{
        login(email,password)
    }
    // Add logic for login if needed
  };

  return (
    <div className='login'>
      <img src={assets.logo_big} className='mylogo' alt="App Logo" />
      <form onSubmit={onSubmitHandler} className='login-form'>
        <p className='title'>{currstate === "SignUp" ? "Sign Up" : "Login"}</p>
        {currstate === "SignUp" && (
          <input
            onChange={(e) => setusername(e.target.value)}
            value={username}
            type="text"
            placeholder='Enter Name'
            name='name'
            required
          />
        )}
        <input
          type="email"
          onChange={(e) => setemail(e.target.value)}
          value={email}
          placeholder='Enter Email'
          name='email'
          required
        />
        <input
          type="password"
          onChange={(e) => setpassword(e.target.value)}
          value={password}
          placeholder='Enter Password'
          name='password'
          required
        />
        <button type='submit'>{currstate === "SignUp" ? "Sign Up" : "Login"}</button>
        <div className="login-terms">
          <input type="checkbox" required />
          <p>Agree to the terms and policy</p>
        </div>
        <div className="login-toggle">
          {currstate === "SignUp" ? (
            <p className='already'>Already have an account? <span onClick={() => setcurrstate("Login")}>Login Here</span></p>
          ) : (
            <p className='new'>Create a new Account? <span onClick={() => setcurrstate("SignUp")}>Click Here</span></p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
