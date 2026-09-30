import React from "react";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-9 h-9 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}