export default async function handler(req, res) {
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Ensure body is parsed
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) { body = {}; }
  }

  const { gameId, jobId } = body;

  // Modified check: Allow "0" or "Studio" to pass through
  if (!gameId || jobId === undefined) {
    return res.status(400).json({ error: 'Missing gameId or jobId' });
  }

  // If jobId is "0", we label it as Studio
  const displayJobId = (jobId === "0" || jobId === "") ? "🛠️ Roblox Studio" : `\`${jobId}\``;

  const discordPayload = {
    username: "Extreme Security Logger",
    embeds: [{
      title: "🛡️ Server Instance Logged",
      color: (jobId === "0" || jobId === "") ? 0xFFA500 : 0x2f3136, // Orange if Studio, Grey if Live
      fields: [
        { name: "🎮 Place ID", value: `\`${gameId}\``, inline: true },
        { name: "🆔 Job ID", value: displayJobId, inline: true },
        { name: "🔗 Quick Join", value: jobId !== "0" ? `[Click to Join](https://www.roblox.com/games/${gameId}?jobId=${jobId})` : "N/A (Studio)" }
      ],
      footer: { text: "Extreme Security System" },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Error' });
  }
}
