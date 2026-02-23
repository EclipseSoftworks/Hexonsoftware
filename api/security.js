export default async function handler(req, res) {
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";
  const YOUR_REAL_GAME_ID = "123456789"; // <--- YOUR ACTUAL PLACE ID

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Get the actual Place ID from the Roblox Header
  const actualPlaceId = req.headers['roblox-id'];
  
  // 2. Parse the body
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) { body = {}; }
  }
  const { gameId, jobId } = body;

  // 3. SECURITY CHECK: Is the header ID different from your Real ID?
  // Note: We skip this if actualPlaceId is undefined (usually means it's Studio)
  const isFake = actualPlaceId && actualPlaceId !== YOUR_REAL_GAME_ID;

  if (isFake) {
    // --- LOG FAKE GAME ATTEMPT ---
    const alertPayload = {
      username: "⚠️ SECURITY BREACH ALERT",
      embeds: [{
        title: "🚫 Unauthorized Script Execution",
        description: "Someone is running your script in an unauthorized game!",
        color: 0xff0000, // Bright Red
        fields: [
          { name: "❌ Spoofed ID (Claimed)", value: `\`${gameId}\``, inline: true },
          { name: "🔍 Actual Place ID (Real)", value: `\`${actualPlaceId}\``, inline: true },
          { name: "🆔 Job ID", value: `\`${jobId}\``, inline: false },
          { name: "🔗 Link to Fake Game", value: `[View Game](https://www.roblox.com/games/${actualPlaceId})` }
        ],
        footer: { text: "Extreme Security System - Anti-Tamper" },
        timestamp: new Date().toISOString()
      }]
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertPayload)
    });

    return res.status(403).json({ error: 'Unauthorized Game' });
  }

  // --- LOG NORMAL VERIFIED GAME ---
  const displayJobId = (jobId === "0" || jobId === "") ? "🛠️ Roblox Studio" : `\`${jobId}\``;

  const discordPayload = {
    username: "Extreme Security Logger",
    embeds: [{
      title: "🛡️ Server Instance Verified",
      color: (jobId === "0" || jobId === "") ? 0xFFA500 : 0x00ff00,
      fields: [
        { name: "🎮 Place ID", value: `\`${gameId}\``, inline: true },
        { name: "🆔 Job ID", value: displayJobId, inline: true },
        { name: "🔗 Quick Join", value: (jobId !== "0" && jobId !== "") ? `[Click to Join](https://www.roblox.com/games/${gameId}?jobId=${jobId})` : "N/A" }
      ],
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
