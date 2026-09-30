import { getTauriInvoke } from "@/lib/tauriInvoke";

/** True when running inside the Matrix desktop client (Tauri). */
export function isTauriApp() {
  return typeof window !== "undefined" && !!(window.__TAURI_INTERNALS__ || window.__TAURI__);
}

/** Lists shareable screens and windows, each with a JPEG thumbnail (data URL). */
export async function listCaptureSources() {
  const invoke = await getTauriInvoke();
  if (!invoke) throw new Error("Client desktop indisponible");
  return invoke("list_capture_sources");
}

/**
 * Starts capturing a source picked in the in-app picker and exposes it as a regular
 * MediaStream (drawn on a canvas), so no browser dialog is ever involved.
 * The capture loop ends by itself as soon as the video track is stopped.
 */
export async function startNativeCapture(sourceId, { fps = 12, maxWidth = 1600 } = {}) {
  const invoke = await getTauriInvoke();
  if (!invoke) throw new Error("Client desktop indisponible");

  const grabFrame = async () => {
    const data = await invoke("capture_source_frame", { id: sourceId, maxWidth });
    const bytes = data instanceof ArrayBuffer ? data : Uint8Array.from(data);
    return createImageBitmap(new Blob([bytes], { type: "image/jpeg" }));
  };

  // The first frame sizes the canvas and is painted before the stream exists: never a black start
  const first = await grabFrame();
  const canvas = document.createElement("canvas");
  canvas.width = first.width;
  canvas.height = first.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(first, 0, 0);
  first.close?.();

  const stream = canvas.captureStream(fps);
  const track = stream.getVideoTracks()[0];

  const endWithError = () => {
    track.stop();
    track.dispatchEvent(new Event("ended")); // lets the app clean up like a browser "stop sharing"
  };

  const loop = async () => {
    let failures = 0;
    while (track.readyState === "live") {
      const startedAt = performance.now();
      try {
        const frame = await grabFrame();
        if (track.readyState !== "live") {
          frame.close?.();
          break;
        }
        if (frame.width !== canvas.width || frame.height !== canvas.height) {
          canvas.width = frame.width;
          canvas.height = frame.height;
        }
        ctx.drawImage(frame, 0, 0);
        frame.close?.();
        failures = 0;
      } catch {
        failures += 1;
        if (failures >= 20) {
          endWithError(); // source closed or unavailable
          break;
        }
      }
      const wait = Math.max(0, 1000 / fps - (performance.now() - startedAt));
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  };
  loop();

  return stream;
}