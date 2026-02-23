export default async function handler(req, res) {
  const WEBHOOK = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";
  const { gameId, jobId, playing } = req.body;

  const isStudio = jobId === "0";
  
  await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: isStudio ? "🛠️ Studio Session" : "🛡️ Live Server Logged",
        color: isStudio ? 0xFFA500 : 0x00FF00,
        fields: [
          { name: "Place ID", value: `${gameId}`, inline: true },
          { name: "Players", value: `${playing}`, inline: true },
          { name: "Job ID", value: `\`${jobId}\`` }
        ]
      }]
    })
  });

  res.status(200).json({ success: true });
}
