import React from "react";

export default function ContactSkeletonRow() {
  return (
    <div className="w-full flex items-center gap-3 px-3 py-2.5 animate-pulse">
      <div
        className="w-10 h-10 rounded-full shrink-0"
        style={{ background: "rgba(168,85,247,0.08)" }}
      />
      <div className="flex-1 min-w-0 space-y-2">
        <div
          className="h-3 rounded w-2/3"
          style={{ background: "rgba(168,85,247,0.1)" }}
        />
        <div
          className="h-2 rounded w-1/3"
          style={{ background: "rgba(168,85,247,0.06)" }}
        />
      </div>
    </div>
  );
}