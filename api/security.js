export default async function handler(req, res) {
  const WEBHOOK = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";

  if (req.method !== 'POST') return res.status(405).send('Use POST');

  try {
    const { gameId, jobId, playing } = req.body || {};
    const isStudio = jobId === "0" || !jobId;

    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: isStudio ? "🛠️ Studio Session" : "🛡️ Live Server",
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
