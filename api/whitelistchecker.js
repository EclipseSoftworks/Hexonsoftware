export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(404).json({ error: "Endpoint not found" });
    }

    const { Hexonwl, Hexprem } = req.body;
    const PUBLIC_WEBHOOK = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";

    try {
        // 1. Get Universe ID
        const universeRes = await fetch(`https://apis.roproxy.com/universes/v1/places/${Hexonwl}/universe`);
        const universeData = await universeRes.json();
        const universeId = universeData?.universeId;

        // 2. Setup fallbacks in case Roblox API is slow
        let gameName = "Unknown Game";
        let playerCount = 0;
        let iconUrl = "";

        if (universeId) {
            const [gameRes, thumbRes] = await Promise.all([
                fetch(`https://games.roproxy.com/v1/games?universeIds=${universeId}`),
                fetch(`https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`)
            ]);

            const gameData = await gameRes.json();
            const thumbData = await thumbRes.json();

            gameName = gameData?.data?.[0]?.name || "Private Game";
            playerCount = gameData?.data?.[0]?.playing || 0;
            iconUrl = thumbData?.data?.[0]?.imageUrl || "";
        }

        // 3. Construct the Join Link
        const joinLink = `roblox://experiences/start?placeId=${Hexonwl}&gameInstanceId=${Hexprem}`;

        // 4. Send to Discord
        const response = await fetch(PUBLIC_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: "Hexon.wtf | Internal Log",
                    description: `**[Click Here to Join Server](${joinLink})**`,
                    color: 0x2b2d31,
                    thumbnail: { url: iconUrl },
                    fields: [
                        { name: "🎮 Game Name", value: `${gameName}`, inline: false },
                        { name: "👥 Players", value: `\`${playerCount.toLocaleString()}\``, inline: true },
                        { name: "🆔 Game ID", value: `\`${Hexonwl}\``, inline: true },
                        { name: "📂 Job ID", value: `\`${Hexprem}\``, inline: false }
                    ],
                    footer: { text: "Hexon Logger • " + new Date().toLocaleTimeString() }
                }]
            })
        });

        if (!response.ok) {
            const errorLog = await response.text();
            console.error("Discord rejected request:", errorLog);
            return res.status(500).json({ error: "Discord rejected the webhook", details: errorLog });
        }

        return res.status(200).json({ status: "success" });
    } catch (err) {
        console.error("Server Error:", err.message);
        return res.status(500).json({ status: "error", message: err.message });
    }
}
