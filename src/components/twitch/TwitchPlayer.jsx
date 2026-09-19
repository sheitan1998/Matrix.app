/**
 * TwitchPlayer — embeds a Twitch live stream using the official
 * Twitch embed player iframe. No API key required — only the `parent`
 * parameter must match the page hostname.
 *
 * The iframe is removed on unmount → stream audio stops automatically.
 */
export default function TwitchPlayer({ channel, autoplay = true, muted = false, className = "" }) {
  if (!channel) return <div className={`w-full h-full bg-black ${className}`} />;

  // Twitch embed requires parent to match the actual page hostname.
  // In production this resolves to matrix-hub.app; in Base44 preview
  // it resolves to the preview domain — both work correctly.
  const parent = window.location.hostname;
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