let currentHandshake = null; // Stores the temporary code

export default async function handler(req, res) {
  const WEBHOOK = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";
  const { placeId, jobId, step, code } = req.body || {};

  // Step 1: Roblox asks for a handshake code
  if (step === "start") {
    currentHandshake = Math.floor(Math.random() * 999999);
    return res.status(200).json({ code: currentHandshake });
  }

  // Step 2: Roblox sends the code back with the data
  if (step === "verify") {
    if (code !== currentHandshake) return res.status(403).send("Fake Request");
    currentHandshake = null; // Reset it so it can't be reused

    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: jobId === "Studio" ? "🛠️ Verified Studio" : "🛡️ Verified Live Server",
          color: jobId === "Studio" ? 0xFFA500 : 0x00FF00,
          description: `**Place ID:** ${placeId}\n**Job ID:** \`${jobId}\``
        }]
      })
    });
    return res.status(200).json({ success: true });
  }

  return res.status(400).send("Invalid Step");
}
