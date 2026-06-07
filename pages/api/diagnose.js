export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { artist1, title1, point1, artist2, title2, point2, artist3, title3, point3 } = req.body;

  const DIFY_API_URL = 'https://api.dify.ai/v1/chat-messages';
  const DIFY_API_KEY = process.env.DIFY_API_KEY; // サーバー側に安全に隠される鍵

  if (!DIFY_API_KEY) {
    return res.status(500).json({ message: 'Dify API Key is not configured on the server.' });
  }

  const requestData = {
    inputs: {
      artist1: artist1,
      title1: title1,
      point1: point1,
      artist2: artist2,
      title2: title2,
      point2: point2,
      artist3: artist3,
      title3: title3,
      point3: point3,
      query: "各楽曲の横にある『好きな点』の指定（メロディか歌詞か）を絶対的な基準として、指定されたフォーマットで診断を実行してください。"
    },
    query: "診断開始",
    response_mode: "blocking",
    user: "music-user-session"
  };
  console.log("Difyに送るデータ:", JSON.stringify(requestData, null, 2));

  try {
    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: data.message || 'Dify API Error' });
    }

    return res.status(200).json({ answer: data.answer });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
