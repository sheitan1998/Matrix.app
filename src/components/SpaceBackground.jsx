import React from "react";

const SPACE_IMG = "/media/tuto-gaming/e20a0d5be_ChatGPTImage2juil202604_45_31.png";

export default function SpaceBackground({ children, overlay = 0.55 }) {
  return (
    <div className="min-h-screen relative"
      style={{
        backgroundImage: `url(${SPACE_IMG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "#050508",
      }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: `rgba(5,5,8,${overlay})` }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}