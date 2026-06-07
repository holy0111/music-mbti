export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. リクエストボディを抽出
  const formData = req.body;
  const { artist1, title1, point1, artist2, title2, point2, artist3, title3, point3 } = formData;

  const DIFY_API_URL = 'https://api.dify.ai/v1/chat-messages';
  const DIFY_API_KEY = process.env.DIFY_API_KEY;

  if (!DIFY_API_KEY) {
    return res.status(500).json({ message: 'Dify API Key is not configured on the server.' });
  }

  // (中略：Difyへのリクエスト部分はそのまま)
  const requestData = {
    inputs: {
      artist1, title1, point1,
      artist2, title2, point2,
      artist3, title3, point3,
      query: "各楽曲の横にある『好きな点』の指定（メロディか歌詞か）を絶対的な基準として、指定されたフォーマットで診断を実行してください。"
    },
    query: "診断開始",
    response_mode: "blocking",
    user: "music-user-session"
  };

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

    const answer = data.answer; // 診断結果

    // --- ここから追加する処理 ---
    try {
      await fetch('https://script.google.com/macros/s/AKfycbwbEGBvYF43-8YL_7EIeUl_2imzp7ABm9KFPPqf43avzBZT2zRSK06J70VLL9ezYcRHCQ/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          result: answer
        })
      });
    } catch (e) {
      console.error("スプレッドシートへの保存に失敗しました", e);
    }
    // --- ここまで ---

    return res.status(200).json({ answer: answer });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
