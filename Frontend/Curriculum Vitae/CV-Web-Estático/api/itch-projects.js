export default async function handler(request, response) {
  const apiKey = process.env.ITCH_API_KEY;

  if (!apiKey) {
    return response.status(503).json({ games: [] });
  }

  const itchResponse = await fetch("https://api.itch.io/profile/games", {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  const data = await itchResponse.json();
  return response.status(itchResponse.status).json(data);
}
