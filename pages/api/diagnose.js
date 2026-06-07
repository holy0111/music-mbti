export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. リクエストボディを抽出
  const formData = req.body;
  const { artist1, title1, point1, artist2, title2, point2, artist3, title3, point3 } = formData;

  const DIFY_API_URL = 'https://api.dify.ai/v1/chat-messages';
  const DIFY_API_KEY = process.env.DIFY_API_KEY;
  
  // ★ここに あなたのGeniusトークンを直接シングルクォーテーションで囲んで貼り付けてください！
  const GENIUS_ACCESS_TOKEN = 'ijB0kjIMOXKZTp16mKiWBPQCsWRmG-v9WzhH77ONsr9bStae3qOBLXnnOQIXbShm'; 

  if (!DIFY_API_KEY) {
    return res.status(500).json({ message: 'Dify API Key is not configured on the server.' });
  }

  // Geniusから曲の情報を検索する内部関数（公式URL直接アクセス版）
  async function searchGenius(artist, title) {
    if (!artist || !title || !GENIUS_ACCESS_TOKEN) return "";
    try {
      // 修正ポイント：0.comy.workers.dev を完全に削除し、公式URLへ直接fetchします
      const geniusRes = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(artist + " " + title)}`, {
        headers: { 'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}` }
      });

      // 返ってきた中身がJSON（プログラム用データ）かどうかを確認するガード処理
      const contentType = geniusRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.log(`Geniusから無効なデータが返されたためスルーします: ${artist} - ${title}`);
        return ""; 
      }

      const json = await geniusRes.json();
      const hits = json.response.hits;
      if (hits && hits.length > 0) {
        const song = hits[0].result;
        return ` (楽曲特定データ: Genius登録タイトル=${song.title}, アーティスト=${song.primary_artist.name}, 歌詞確認用URL=${song.url})`;
      }
      return "";
    } catch (e) {
      console.error("Genius検索エラー（ログ出力のみ）:", e);
      return ""; 
    }
  }

  // 「歌詞が好き」が選ばれている場合のみ、裏でGeniusから正確な楽曲データを検索して補足する
  let lyricsData1 = "";
  let lyricsData2 = "";
  let lyricsData3 = "";

  if (point1 === '歌詞') lyricsData1 = await searchGenius(artist1, title1);
  if (point2 === '歌詞') lyricsData2 = await searchGenius(artist2, title2);
  if (point3 === '歌詞') lyricsData3 = await searchGenius(artist3, title3);

  // Difyへのリクエストデータを作成
  const requestData = {
    inputs: {
      artist1, 
      title1, 
      point1: point1 + lyricsData1,
      artist2, 
      title2, 
      point2: point2 + lyricsData2,
      artist3, 
      title3, 
      point3: point3 + lyricsData3,
      query: "各楽曲の横にある『好きな点』の指定（メロディか歌詞か）を絶対的な基準として、指定されたフォーマットで診断を実行してください。"
    },
    query: "診断開始",
    response_mode: "blocking",
    user: "music-user-session"
  };

  console.log("Difyに送るデータ(Genius連携後):", JSON.stringify(requestData, null, 2));

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

    // --- スプレッドシートへのログ保存処理 ---
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

    return res.status(200).json({ answer: answer });
  } catch (error) {
    console.error("サーバー内部エラー:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
