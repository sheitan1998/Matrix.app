import React from "react";
import { createPortal } from "react-dom";
import MessageOverlay from "@/components/messaging/MessageOverlay";

export default function MessagingPanel({ user, open, preselectedEmail, onClose, onMessagesRead }) {
  if (!open || !user) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80]" style={{ background: "#0a050f" }}>
      <MessageOverlay
        user={user}
        preselectedEmail={preselectedEmail}
        onClose={onClose}
        onMessagesRead={onMessagesRead}
      />
    </div>,
    document.body
  );
}