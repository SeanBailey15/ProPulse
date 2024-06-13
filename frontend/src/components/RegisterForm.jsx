// frontend/src/components/RegisterForm.js

import React, { useState } from "react";
import axios from "axios";

const { VITE_VAPID_PUBLIC_KEY } = import.meta.env;

// Web-Push
// Public base64 to Uint
function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [agreeToNotifications, setAgreeToNotifications] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    // Register the user
    const response = await axios.post("http://localhost:3001/auth/register", {
      email,
      password,
      firstName,
      lastName,
      phone,
      organization,
      title,
    });

    const userId = response.data.id;

    if (agreeToNotifications && "serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VITE_VAPID_PUBLIC_KEY),
      });

      console.log(subscription);
      console.log(userId);
      await axios.post(
        `http://localhost:3001/push/subscribe/${userId}`,
        JSON.stringify(subscription)
      );
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
        required
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
        required
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
        required
      />
      <input
        type="text"
        value={organization}
        onChange={(e) => setOrganization(e.target.value)}
        placeholder="Organization"
        required
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
      />
      <label>
        <input
          type="checkbox"
          checked={agreeToNotifications}
          onChange={(e) => setAgreeToNotifications(e.target.checked)}
        />
        I agree to receive notifications
      </label>
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
