import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

export default function LightboxViewer({ image, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isFullView, setIsFullView] = useState(true);
  const dragRef = useRef(null);
  const dragStart = useRef(null);
  const containerRef = useRef(null);

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setIsFullView(true);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => {
      const nz = Math.min(MAX_ZOOM, z + 0.5);
      if (nz > 1) setIsFullView(false);
      return nz;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const nz = Math.max(MIN_ZOOM, z - 0.5);
      if (nz === 1) {
        setOffset({ x: 0, y: 0 });
        setIsFullView(true);
      }
      return nz;
    });
  }, []);

  const handleToggleFull = useCallback(() => {
    if (isFullView) {
      setZoom(2);
      setIsFullView(false);
    } else {
      resetView();
    }
  }, [isFullView, resetView]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    setZoom((z) => {
      const nz = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta));
      if (nz === 1) {
        setOffset({ x: 0, y: 0 });
        setIsFullView(true);
      } else {
        setIsFullView(false);
      }
      return nz;
    });
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (zoom <= 1) return;
    dragRef.current = true;
    dragStart.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
    e.target.setPointerCapture?.(e.pointerId);
  }, [zoom, offset]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = false;
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") handleZoomIn();
      else if (e.key === "-") handleZoomOut();
      else if (e.key === "0") resetView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, handleZoomIn, handleZoomOut, resetView]);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.95)" }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-bold text-white/80 uppercase tracking-wider truncate max-w-[50%]">
          {image.title}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed tap-sm"
            title="Dézoomer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-white/50 w-12 text-center">{zoomPercent}%</span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed tap-sm"
            title="Zoomer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFull}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition tap-sm"
            title={isFullView ? "Plein écran" : "Ajuster"}
          >
            {isFullView ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition tap-sm ml-1"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ cursor: zoom > 1 ? (dragRef.current ? "grabbing" : "grab") : "default" }}
      >
        <img
          src={normalizeAppAssetUrl(image.img)}
          alt={image.title}
          draggable={false}
          className="select-none"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: isFullView ? "auto" : "auto",
            objectFit: "contain",
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: dragRef.current ? "none" : "transform 0.15s ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Hint */}
      {zoom === 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] text-white/40 uppercase tracking-wider pointer-events-none"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          Molette pour zoomer · Glisser pour déplacer
        </div>
      )}
    </div>
  );
}