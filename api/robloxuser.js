export default function handler(req, res) {
  res.status(200).json({
    message: "API for hexon.wtf list of all roblox users",
    status: "active",
    total_users: 142093,
    last_updated: new Date().toISOString()
  });
}
