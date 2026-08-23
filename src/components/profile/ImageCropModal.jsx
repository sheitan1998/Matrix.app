import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react";

/**
 * ImageCropModal
 * Interactive image cropping tool with zoom and pan.
 * Allows users to position their profile picture before uploading.
 *
 * @param {File} file - The image file to crop
 * @param {number} aspect - Aspect ratio (default 1 for square avatar)
 * @param {number} outputSize - Output image size in px (default 400)
 * @param {function} onCrop - Called with a File when crop is confirmed
 * @param {function} onClose - Called when modal is closed
 */
export default function ImageCropModal({ file, aspect = 1, outputSize = 400, onCrop, onClose }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
      // Center the image
      setScale(1);
      setPos({ x: 0, y: 0 });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  // Touch support
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setDragging(true);
    setDragStart({ x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y });
  };
  const handleTouchMove = (e) => {
    if (!dragging || e.touches.length !== 1) return;
    e.preventDefault();
    setPos({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  };
  const handleTouchEnd = () => setDragging(false);

  const handleConfirm = () => {
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = Math.round(outputSize / aspect);
    const ctx = canvas.getContext("2d");

    // Fill background (for transparent PNGs)
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (imgRef.current && imgNatural.w && imgNatural.h) {
      const img = imgRef.current;
      const containerW = containerRef.current?.clientWidth || 300;
      const containerH = containerRef.current?.clientHeight || 300;

      // The displayed image size (before scale)
      const imgDisplayW = img.clientWidth;
      const imgDisplayH = img.clientHeight;

      // Calculate the source crop region
      // The container center is the crop center
      // We need to map from display coordinates to natural coordinates
      const scaleX = imgNatural.w / imgDisplayW;
      const scaleY = imgNatural.h / imgDisplayH;

      // The crop window in display coordinates (centered in container)
      const cropW = containerW;
      const cropH = containerH;

      // Image position relative to container top-left
      const imgOffsetX = (containerW - imgDisplayW) / 2 + pos.x;
      const imgOffsetY = (containerH - imgDisplayH) / 2 + pos.y;

      // Source crop region in natural coordinates
      const srcX = (-imgOffsetX) * scaleX;
      const srcY = (-imgOffsetY) * scaleY;
      const srcW = cropW * scaleX;
      const srcH = cropH * scaleY;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], file.name || "cropped.jpg", { type: "image/jpeg" });
      onCrop(croppedFile);
    }, "image/jpeg", 0.9);
  };

  if (!imageUrl) return null;

  const containerSize = 280;
  const containerH = Math.round(containerSize / aspect);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl p-5" style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.3)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white">Ajuster l'image</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop area */}
        <div
          ref={containerRef}
          className="relative mx-auto rounded-2xl overflow-hidden cursor-move select-none"
          style={{ width: containerSize, height: containerH, background: "rgba(0,0,0,0.4)" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt=""
            draggable={false}
            className="absolute select-none pointer-events-none"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${scale})`,
              transition: dragging ? "none" : "transform 0.05s",
            }}
          />
          {/* Crop overlay grid */}
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)" }}>
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "33.33% 33.33%",
            }} />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="w-9 h-9 rounded-lg flex items-center justify-center text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            className="flex-1 accent-purple-500"
          />
          <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="w-9 h-9 rounded-lg flex items-center justify-center text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }} className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 tap-sm" style={{ background: "rgba(255,255,255,0.05)" }} title="Réinitialiser">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
        >
          <Check className="w-4 h-4" /> Valider
        </button>
      </div>
    </div>,
    document.body
  );
}