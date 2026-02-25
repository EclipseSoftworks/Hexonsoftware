export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(404).json({ error: "Endpoint not found" });
    }

    const { Hexonwl, Hexprem } = req.body;
    
    // RESTORED: Your specific Webhook URL
    const PUBLIC_WEBHOOK = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";

    try {
        // 1. Get Universe ID (Safe lookup)
        const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${Hexonwl}/universe`);
        const universeData = await universeRes.json();
        const universeId = universeData?.universeId;

        if (!universeId) {
            // If the Place ID is invalid, we log what we have and stop
            throw new Error(`Invalid Place ID: ${Hexonwl}`);
        }

        // 2. Fetch Game Details & Thumbnail simultaneously
        const [gameRes, thumbRes] = await Promise.all([
            fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
            fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`)
        ]);

        const gameData = await gameRes.json();
        const thumbData = await thumbRes.json();

        // 3. Fallback logic to prevent "TypeError: Cannot read properties of undefined"
        const gameInfo = gameData?.data?.[0] || { name: "Unknown Game", playing: 0 };
        const iconUrl = thumbData?.data?.[0]?.imageUrl || "";

        // 4. Send the Log to Discord
        await fetch(PUBLIC_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: "Hexon.wtf | Internal Log",
                    color: 0x2b2d31,
                    thumbnail: { url: iconUrl },
                    fields: [
                        { name: "Game Name", value: `**${gameInfo.name}**`, inline: false },
                        { name: "Game ID", value: `\`${Hexonwl}\``, inline: true },
                        { name: "Job ID", value: `\`${Hexprem}\``, inline: true },
                        { name: "Players", value: `👤 ${gameInfo.playing.toLocaleString()}`, inline: true }
                    ],
                    footer: { text: "Hexon Internal Logger" },
                    timestamp: new Date().toISOString()
                }]
            })
        });

        return res.status(200).json({ status: "success" });
    } catch (err) {
        console.error("Logger Error:", err.message);
        return res.status(500).json({ status: "error", message: err.message });
    }
}
