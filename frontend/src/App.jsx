import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Spinner } from "reactstrap";
import { jwtDecode } from "jwt-decode";
import UserContext from "./contexts/UserContext";
import useLocalStorage from "./hooks/useLocalStorage";
import ProPulseApi from "./api";
import "./styles/App.css";

import NavBar from "./components/Navbar";
import RouteList from "./RouteList";

export const TOKEN_STORAGE_ID = "propulse-token";

const App = () => {
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(
    function loadUserInfo() {
      async function getCurrentUser() {
        if (token) {
          try {
            let { id } = jwtDecode(token);
            ProPulseApi.token = token;
            let currentUser = await ProPulseApi.getCurrentUser(id);
            setCurrentUser(currentUser);
          } catch (err) {
            console.error(err);
            setCurrentUser(null);
            setError(err);
          }
        }
        setIsLoading(false);
      }

      setIsLoading(true);
      getCurrentUser();
    },
    [token]
  );

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function signUp(formData) {
    const token = await ProPulseApi.registerUser(formData);
    setToken(token);
    return token;
  }

  async function login(formData) {
    const token = await ProPulseApi.loginUser(formData);
    setToken(token);
  }

  function logout() {
    setCurrentUser(null);
    setToken(null);
  }

  if (isLoading)
    return (
      <div className="App">
        <Spinner className="App-spinner" color="secondary">
          Loading...
        </Spinner>
      </div>
    );

  if (error !== null) {
    return (
      <div className="App">
        <h1>An error occurred:</h1>
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider
          value={{
            currentUser,
            setCurrentUser,
            token,
            setToken,
            logout,
          }}
        >
          <NavBar
            color="dark"
            light={false}
            dark={true}
            expand="md"
            container="fluid"
          />
          <RouteList
            signUp={signUp}
            login={login}
            urlBase64ToUint8Array={urlBase64ToUint8Array}
          />
        </UserContext.Provider>
      </BrowserRouter>
    </>
  );
};

export default App;
