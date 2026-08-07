"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { requestPushPermission } from "@/services/push";

export function PushNotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user already made a choice
    const pushPreference = localStorage.getItem("push_preference");
    // Also check if notifications are already granted or denied
    const permission = typeof window !== "undefined" && "Notification" in window ? Notification.permission : "denied";

    if (!pushPreference && permission === "default") {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = async () => {
    setIsSubmitting(true);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.warn("VAPID Key not found. Cannot request push permission.");
      localStorage.setItem("push_preference", "error_missing_key");
      setIsVisible(false);
      return;
    }

    const token = await requestPushPermission(vapidKey);
    
    if (token) {
      localStorage.setItem("push_preference", "accepted");
    } else {
      localStorage.setItem("push_preference", "denied_or_failed");
    }
    
    setIsVisible(false);
    setIsSubmitting(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("push_preference", "dismissed");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Fique por dentro das novidades!</p>
          <p className="text-sm text-gray-600">Quer receber um aviso quando publicarmos novos itens no bazar?</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button 
          onClick={handleDismiss}
          disabled={isSubmitting}
          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Não, obrigado
        </button>
        <button 
          onClick={handleAccept}
          disabled={isSubmitting}
          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : null}
          Quero receber
        </button>
        <button 
          onClick={handleDismiss} 
          className="p-2 text-gray-400 hover:text-gray-600 sm:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
