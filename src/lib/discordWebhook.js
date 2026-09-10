import { toast } from "sonner";

const WEBHOOK_KEY = "cs-discord-webhook";

export function getDiscordWebhook() {
  return localStorage.getItem(WEBHOOK_KEY) || "";
}

export function setDiscordWebhook(url) {
  if (url && url.trim()) localStorage.setItem(WEBHOOK_KEY, url.trim());
  else localStorage.removeItem(WEBHOOK_KEY);
}

export function isDiscordWebhookValid(url) {
  return /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url);
}

export async function sendDiscordNotification(message) {
  const url = getDiscordWebhook();
  if (!url) return false;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "CS PRO · Chat Koordinasi",
        avatar_url: "https://i.ibb.co/qYjshGng/image.png",
        embeds: [{
          title: "💬 Pesan Baru di Chat Koordinasi",
          description: (message.message || "").substring(0, 4000) || "*(kosong)*",
          color: 0xF5C542,
          fields: [
            { name: "👤 Pengirim", value: message.name || "Unknown", inline: true },
            { name: "📧 Email", value: message.email || "-", inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "CS PRO Suite Dashboard" },
        }],
      }),
    });
    return true;
  } catch {
    return false;
  }
}