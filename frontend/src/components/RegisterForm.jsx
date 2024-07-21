// frontend/src/components/RegisterForm.js

import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const { VITE_VAPID_PUBLIC_KEY } = import.meta.env;

// Web-Push
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    organization: "",
    title: "",
  });
  const [agreeToNotifications, setAgreeToNotifications] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({
      ...data,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Register the user
      const response = await axios.post(
        "http://localhost:3001/auth/register",
        formData
      );

      const user = jwtDecode(response.data.token);
      const userId = user.id;

      if (agreeToNotifications && "serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VITE_VAPID_PUBLIC_KEY),
        });

        await axios.post(
          `http://localhost:3001/push/subscribe/${userId}`,
          subscription,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
        required
      />
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
        required
      />
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone"
        required
      />
      <input
        type="text"
        name="organization"
        value={formData.organization}
        onChange={handleChange}
        placeholder="Organization"
        required
      />
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
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
