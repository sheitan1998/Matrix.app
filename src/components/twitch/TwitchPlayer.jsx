/**
 * TwitchPlayer — embeds a Twitch live stream using the official
 * Twitch embed player iframe. No API key required — only the `parent`
 * parameter must match the page hostname.
 *
 * The iframe is removed on unmount → stream audio stops automatically.
 */
export default function TwitchPlayer({ channel, autoplay = true, muted = false, className = "" }) {
  if (!channel) return <div className={`w-full h-full bg-black ${className}`} />;

  const parent = window.location.hostname === "localhost" ? "localhost" : "matrix-hub.base44.app";
  const params = new URLSearchParams({
    channel,
    parent,
    muted: muted ? "true" : "false",
    autoplay: autoplay ? "true" : "false",
  });

  return (
    <iframe
      src={`https://player.twitch.tv/?${params.toString()}`}
      allowFullScreen
      className={`w-full h-full border-0 ${className}`}
      title={`Twitch stream: ${channel}`}
    />
  );
}