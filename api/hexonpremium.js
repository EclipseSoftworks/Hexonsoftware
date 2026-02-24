export default function handler(req, res) {
  res.status(200).json({
    message: "API for hexon.wtf list of all premium roblox users",
    status: "active",
    premium_tier: "enterprise",
    last_updated: new Date().toISOString()
  });
}
