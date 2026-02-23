export default async function handler(req, res) {
  const WEBHOOK = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";

  if (req.method !== 'POST') return res.status(405).send('Use POST');

  try {
    const { gameId, jobId, playing } = req.body || {};

    // 1. Basic Guard: Check if it's actually a Roblox server calling
    const userAgent = req.headers['user-agent'] || "";
    if (!userAgent.includes("Roblox")) {
      return res.status(403).json({ error: "Access Denied: Not Roblox" });
    }

    // 2. Verification Step: Check Roblox Sessions API
    // This confirms the JobID actually exists on Roblox's hardware
    if (jobId && jobId !== "0") {
        const robloxVerify = await fetch(`https://games.roblox.com/v1/games/${gameId}/servers/Public?limit=100`);
        const serverData = await robloxVerify.json();
        
        // Check if our jobId is in the list of active public servers
        const isValidServer = serverData.data?.some(server => server.id === jobId);
        
        if (!isValidServer && !process.env.NODE_ENV === 'development') {
            return res.status(401).json({ error: "Fake Server Detected" });
        }
    }

    // 3. Send to Discord
    const isStudio = jobId === "0" || !jobId;
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: isStudio ? "🛠️ Studio Session" : "🛡️ Verified Live Server",
          footer: { text: "Verified via Roblox Sessions API" },
          color: isStudio ? 0xFFA500 : 0x00FF00,
          description: `**Place:** ${gameId}\n**Players:** ${playing}\n**Job:** \`${jobId}\``
        }]
      })
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
