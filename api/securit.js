// api/ExtremeSecurity.js
export default async function handler(req, res) {
  // 1. Paste your webhook URL here
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { gameId, jobId } = req.body;

  // Check if Roblox sent the data
  if (!gameId || !jobId) {
    return res.status(400).json({ error: 'Missing gameId or jobId' });
  }

  const discordPayload = {
    username: "Extreme Security Logger",
    avatar_url: "https://i.imgur.com/8nS8z3S.png", // Optional cool icon
    embeds: [{
      title: "🛡️ Server Instance Logged",
      description: "A new Roblox server instance has been detected.",
      color: 0x2f3136, // Dark sleek grey
      fields: [
        { name: "🎮 Place ID", value: `\`${gameId}\``, inline: true },
        { name: "🆔 Job ID", value: `\`${jobId}\``, inline: true },
        { name: "🔗 Quick Join", value: `[Click to Join Server](https://www.roblox.com/games/${gameId}?jobId=${jobId})` }
      ],
      footer: { text: "Extreme Security System" },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: "Sent to Discord" });
    } else {
      return res.status(500).json({ error: 'Discord API error' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
