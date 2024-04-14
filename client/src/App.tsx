import React, { useEffect, useState } from "react";
import logging from "./config/logging";
import axios from "axios";
import { SERVER_URL } from "./config/constants";

const App: React.FunctionComponent = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  
  useEffect(() => {
    getUserData()
  }, []);

  const getUserData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const res = await axios
      .get(`${SERVER_URL}/me`, {
        withCredentials: true,
        headers: {'Authorization': token}
      });
      if (res.data.user) {
        setUser(res.data.user);
        setLoading(false);
      } else {
        redirectToLogin();
      }
      } catch (err) {
        setLoading(false);
        logging.error(err, "/me");
      }
    }

  // Redirect to login
  const redirectToLogin = () => {
    window.location.assign(`${SERVER_URL}/login/${email}`);
  };

  if (loading) return <p>loading...</p>;
  return <div>
    {
      !user ?
      <>
        <input type="email" onChange={(e) => setEmail(e.target.value)} value={email}/>
        <div onClick={redirectToLogin}>login</div>
        <div onClick={getUserData}>try again</div>
      </>
      :
      <div style={{'whiteSpace': 'pre-line'}}>{JSON.stringify(user, null, 2)}</div>
    }
  </div>;
};

export default App;
