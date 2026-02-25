export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(404).json({ error: "Endpoint not found" });
    }

    // Ensure we have the data from the request body
    const { Hexonwl, Hexprem } = req.body;
    if (!Hexonwl) return res.status(400).json({ error: "Missing Place ID (Hexonwl)" });

    const PUBLIC_WEBHOOK = "https://discord.com/api/webhooks/1475590835507695693/Vq3sB1-tSW5Nxv1VyMW_ml3r1zGzNUpwvH81WYMT-AXBXwLHjl4FU8XZ-Ok6uk37c6ue";

    try {
        // We use 'roproxy.com' instead of 'roblox.com' because Roblox blocks many hosting providers (Vercel, etc.)
        
        // 1. Get Universe ID
        const universeRes = await fetch(`https://apis.roproxy.com/universes/v1/places/${Number(Hexonwl)}/universe`);
        const universeData = await universeRes.json();
        const universeId = universeData?.universeId;

        if (!universeId) {
            throw new Error(`Universe ID not found for Place: ${Hexonwl}. Is the ID correct?`);
        }

        // 2. Fetch Game Details & Thumbnail using the Proxy
        const [gameRes, thumbRes] = await Promise.all([
            fetch(`https://games.roproxy.com/v1/games?universeIds=${universeId}`),
            fetch(`https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`)
        ]);

        const gameData = await gameRes.json();
        const thumbData = await thumbRes.json();

        // Safety fallback values
        const gameInfo = gameData?.data?.[0] || { name: "Unknown/Private Game", playing: 0 };
        const iconUrl = thumbData?.data?.[0]?.imageUrl || "https://tr.rbxcdn.com/53ebcb1015f8589ea6d828873681817d/150/150/Image/Png";

        // 3. Send to Discord
        const discordPayload = {
            embeds: [{
                title: "Hexon.wtf | Internal Log",
                description: `Successfully logged data for Place ID: ${Hexonwl}`,
                color: 0x2b2d31,
                thumbnail: { url: iconUrl },
                fields: [
                    { name: "🎮 Game Name", value: `**${gameInfo.name}**`, inline: false },
                    { name: "🆔 Game ID", value: `\`${Hexonwl}\``, inline: true },
                    { name: "📂 Job ID", value: `\`${Hexprem || 'N/A'}\``, inline: true },
                    { name: "👥 Players", value: `\`${gameInfo.playing.toLocaleString()}\``, inline: true }
                ],
                footer: { text: "Hexon.wtf Logger • " + new Date().toLocaleString() }
            }]
        };

        const webhookRes = await fetch(PUBLIC_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        });

        if (!webhookRes.ok) {
            const errorText = await webhookRes.text();
            throw new Error(`Discord Webhook failed: ${errorText}`);
        }

        return res.status(200).json({ status: "success", universeId });
    } catch (err) {
        console.error("Critical Error:", err.message);
        
        // Final fallback: Send a basic log to Discord if the Roblox API part failed
        // This ensures you at least get the IDs even if the game info fetch fails
        await fetch(PUBLIC_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `⚠️ **Log Error:** Could not fetch game metadata.\n**Place ID:** ${Hexonwl}\n**Job ID:** ${Hexprem}\n*Error: ${err.message}*`
            })
        });

        return res.status(500).json({ status: "error", message: err.message });
    }
}
