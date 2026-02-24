export default async function handler(req, res) {
    if (req.method !== 'POST') {
        // If someone visits via Browser, show a fake error to stay "incognito"
        return res.status(404).json({ error: "Endpoint not found" });
    }

    const { Hexonwl, Hexprem } = req.body;
    
    // Replace the URL below with your actual Webhook URL
    const PUBLIC_WEBHOOK = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";

    try {
        await fetch(PUBLIC_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: "Hexon.wtf | Internal Log",
                    fields: [
                        { name: "Game ID", value: `${Hexonwl}`, inline: true },
                        { name: "Job ID", value: `${Hexprem}`, inline: true }
                    ],
                    color: 0x2b2d31
                }]
            })
        });

        return res.status(200).json({ status: "success" });
    } catch (err) {
        return res.status(500).json({ status: "error" });
    }
}
