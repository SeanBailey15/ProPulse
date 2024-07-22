self.addEventListener("push", function (event) {
  try {
    // Ensure the event data is in JSON format
    const data = event.data ? event.data.json() : {};

    const options = {
      body: data.body || "Default notification body", // Fallback body text
      icon: "icons/ProPulse-icon.svg", // path to icon image in the public directory
    };

    // Only include URL if it's present in the push data
    if (data.url) {
      options.data = { url: data.url };
    }

    event.waitUntil(
      self.registration.showNotification(data.title || "Default Title", options)
    );
  } catch (e) {
    console.error("Error processing push event:", e);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Close the notification immediately

  const url = event.notification.data?.url;

  // If no URL is present, do nothing further
  if (!url) {
    return;
  }

  // Focus on an existing window or open a new window
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
      .catch((error) => {
        console.error("Error handling notification click:", error);
      })
  );
});

self.addEventListener("install", (event) => {
  self.skipWaiting(); // Activate the new service worker immediately
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim() // Claim clients immediately
  );
});
