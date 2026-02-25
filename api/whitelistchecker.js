export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(404).json({ error: "Endpoint not found" });
    }

    const { Hexonwl, Hexprem } = req.body; // Hexonwl = Game ID, Hexprem = Job ID
    const PUBLIC_WEBHOOK = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";

    try {
        // 1. Get Universe ID (Using RoProxy to avoid 403 Forbidden)
        const universeRes = await fetch(`https://apis.roproxy.com/universes/v1/places/${Hexonwl}/universe`);
        const universeData = await universeRes.json();
        const universeId = universeData?.universeId;

        if (!universeId) throw new Error("Could not fetch Universe ID");

        // 2. Get Game Data (Name, Players, Thumbnail)
        const [gameRes, thumbRes] = await Promise.all([
            fetch(`https://games.roproxy.com/v1/games?universeIds=${universeId}`),
            fetch(`https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`)
        ]);

        const gameData = await gameRes.json();
        const thumbData = await thumbRes.json();

        const gameInfo = gameData?.data?.[0] || { name: "Unknown", playing: 0 };
        const iconUrl = thumbData?.data?.[0]?.imageUrl || "";

        // 3. Create the Join Link
        const joinLink = `roblox://experiences/start?placeId=${Hexonwl}&gameInstanceId=${Hexprem}`;

        // 4. Send to Discord
        await fetch(PUBLIC_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: `🎮 ${gameInfo.name}`,
                    color: 0x2b2d31,
                    thumbnail: { url: iconUrl },
                    fields: [
                        { name: "👥 Players", value: `\`${gameInfo.playing.toLocaleString()}\``, inline: true },
                        { name: "🆔 Place ID", value: `\`${Hexonwl}\``, inline: true },
                        { name: "🔗 Join Server", value: `[Click to Launch Roblox](${joinLink})`, inline: false }
                    ],
                    footer: { text: "Hexon.wtf Logger" },
                    timestamp: new Date().toISOString()
                }],
                // Discord Components for a real button (Optional, but looks cleaner)
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        style: 5,
                        label: "Join Game",
                        url: joinLink
                    }]
                }]
            })
        });

        return res.status(200).json({ status: "success" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: err.message });
    }
}
