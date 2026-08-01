import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, Maximize2 } from "lucide-react";
import TwitchPlayer from "@/components/twitch/TwitchPlayer";

const TwitchMiniPlayerContext = createContext({
  minimize: () => {},
  close: () => {},
  expand: () => {},
  mode: "hidden",
  currentStream: null,
});

export const useTwitchMiniPlayer = () => useContext(TwitchMiniPlayerContext);

/**
 * TwitchMiniPlayerProvider — manages a floating Twitch stream overlay.
 * Scoped to the Twitch universe (mounted inside TwitchLayout).
 * When closed or expanded, the iframe is removed → stream audio stops.
 */
export function TwitchMiniPlayerProvider({ children }) {
  const [currentStream, setCurrentStream] = useState(null);
  const [mode, setMode] = useState("hidden"); // "hidden" | "mini"
  const navigate = useNavigate();

  const minimize = useCallback((stream) => {
    setCurrentStream(stream);
    setMode("mini");
  }, []);

  const close = useCallback(() => {
    setCurrentStream(null);
    setMode("hidden");
  }, []);

  const expand = useCallback(() => {
    if (currentStream) {
      navigate(`/twitch/watch/${currentStream.user_login}`);
    }
    setMode("hidden");
  }, [currentStream, navigate]);

  return (
    <TwitchMiniPlayerContext.Provider value={{ currentStream, mode, minimize, close, expand }}>
      {children}
      {currentStream && mode === "mini" && (
        <div
          className="fixed z-[200] overflow-hidden bg-black shadow-2xl shadow-black/60 group"
          style={{ bottom: 84, right: 20, width: 360, height: 202, borderRadius: 12 }}
        >
          <TwitchPlayer channel={currentStream.user_login} autoplay muted={false} />

          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-start justify-between gap-2 px-2.5 py-2 bg-gradient-to-b from-black/85 to-transparent pointer-events-auto">
              <span className="text-xs text-white font-medium truncate flex-1 pt-0.5">
                {currentStream.user_name}
              </span>
              <button
                onClick={close}
                className="shrink-0 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center tap-sm transition-colors"
                aria-label="Fermer le lecteur"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div className="flex items-center justify-end px-2.5 py-2 bg-gradient-to-t from-black/85 to-transparent pointer-events-auto">
              <button
                onClick={expand}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center tap-sm transition-colors"
                aria-label="Agrandir le lecteur"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </TwitchMiniPlayerContext.Provider>
  );
}