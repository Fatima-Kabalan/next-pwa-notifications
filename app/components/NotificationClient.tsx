"use client";

import { useEffect, useState } from "react";

interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface PushSubscriptionObject {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export default function NotificationClient() {
  const [subscription, setSubscription] =
    useState<PushSubscriptionObject | null>(null);

  useEffect(() => {
    // Register the service worker immediately
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.register(
            "/service-worker.js"
          );
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      }
    };

    registerServiceWorker();

    // Request notification permission immediately
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      }
    });
  }, []);

  async function subscribeUser() {
    const registration = await navigator.serviceWorker.ready;
    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || ""
      ),
    });

    const subscriptionObject: PushSubscriptionObject = {
      endpoint: pushSubscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(pushSubscription.getKey("p256dh")),
        auth: arrayBufferToBase64(pushSubscription.getKey("auth")),
      },
    };

    setSubscription(subscriptionObject);
    console.log("User is subscribed:", subscriptionObject);

    // Send the notification immediately after subscription
    sendNotification(subscriptionObject);
  }

  async function sendNotification(subscription: PushSubscriptionObject) {
    const payload = {
      title: "Test push",
      body: "This is a test push notification",
    };

    try {
      const response = await fetch("/api/sendNotification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription, payload }),
      });

      if (response.ok) {
        try {
          const responseBody = await response.json();
          console.log("Notification sent:", responseBody);
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", jsonError);
        }
      } else {
        const errorResponse = await response.text();
        console.error(
          "Failed to send notification:",
          response.status,
          errorResponse
        );
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (buffer === null) return "";
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-4">
      <button
        onClick={subscribeUser}
        className="border rounded-full bg-green-400 p-2 text-white"
      >
        Subscribe to Notifications
      </button>
    </div>
  );
}
