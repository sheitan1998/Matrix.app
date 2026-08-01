/**
 * TwitchChat — embeds the Twitch live chat using the official
 * Twitch chat embed iframe. No API key required — only the `parent`
 * parameter must match the page hostname.
 */
export default function TwitchChat({ channel, className = "" }) {
  if (!channel) return <div className={`w-full h-full bg-[#0a0714] ${className}`} />;

  const parent = window.location.hostname;
  const src = `https://www.twitch.tv/embed/${channel}/chat?parent=${parent}&darkpopout=true`;

  return (
    <iframe
      src={src}
      className={`w-full h-full border-0 ${className}`}
      title={`Twitch chat: ${channel}`}
    />
  );
}