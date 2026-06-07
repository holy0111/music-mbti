import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    artist1: '', title1: '', point1: 'メロディ',
    artist2: '', title2: '', point2: 'メロディ',
    artist3: '', title3: '', point3: 'メロディ'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.answer);
        // 紙吹雪演出
        if (typeof window !== 'undefined' && window.confetti) {
          window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      } else {
        alert('エラーが発生しました: ' + data.message);
      }
    } catch (error) {
      alert('通信エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const text = encodeURIComponent("🎵 3曲でわかる音楽MBTI性格診断を試しました！\n\n" + result.substring(0, 100) + "...\n\n#音楽MBTI性格診断");
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="container">
      <main>
        <h1>🎵 3曲でわかる音楽MBTI性格診断</h1>
        
        {!loading && !result && (
          <form onSubmit={handleSubmit}>
            {[1, 2, 3].map((num) => (
              <div className="song-group" key={num}>
                <span className="song-title-label">✦ {num}曲目</span>
                <div className="input-row">
                  <input type="text" name={`artist${num}`} placeholder="アーティスト名" required onChange={handleChange} />
                  <input type="text" name={`title${num}`} placeholder="曲名" required onChange={handleChange} />
                </div>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name={`point${num}`} value="メロディ" defaultChecked onChange={handleChange} /> メロディが好き
                  </label>
                  <label className="radio-label">
                    <input type="radio" name={`point${num}`} value="歌詞" onChange={handleChange} /> 歌詞が好き
                  </label>
                </div>
              </div>
            ))}
            <button type="submit" className="btn-submit">診断を始める</button>
          </form>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>AIがあなたの音楽性をディープに解析中...</p>
          </div>
        )}

        {result && !loading && (
          <div id="result-card">
            <div className="result-header">あなたの音楽精神分析結果</div>
            <div className="result-body">{result}</div>
            <button className="btn-x" onClick={handleShare}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Xに結果をポストする
            </button>
            <button className="btn-retry" onClick={() => setResult('')}>もう一度診断する</button>
          </div>
        )}
      </main>

      {/* スクリプト読み込み */}
      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js" async></script>

      <style jsx global>{`
        :root {
          --bg-color: #0d1117;
          --card-bg: #161b22;
          --accent-color: #58a6ff;
          --text-color: #c9d1d9;
          --text-main: #f0f6fc;
          --border-color: #30363d;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--bg-color);
          color: var(--text-color);
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          max-width: 500px;
          width: 100%;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        h1 {
          font-size: 20px;
          text-align: center;
          color: var(--text-main);
          margin-bottom: 24px;
          font-weight: 700;
        }
        .song-group {
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        .song-title-label {
          font-size: 14px;
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 8px;
          display: block;
        }
        .input-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        input[type="text"] {
          flex: 1;
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 10px;
          color: var(--text-main);
          font-size: 14px;
          outline: none;
          width: 40%;
        }
        input[type="text"]:focus {
          border-color: var(--accent-color);
        }
        .radio-group {
          display: flex;
          gap: 12px;
          font-size: 13px;
        }
        .radio-label {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .btn-submit {
          width: 100%;
          background-color: #238636;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-submit:hover { background-color: #2ea043; }
        .loading { text-align: center; margin: 20px 0; }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        #result-card {
          border-top: 2px solid var(--accent-color);
          padding-top: 16px;
        }
        .result-header {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: var(--text-main);
          margin-bottom: 12px;
        }
        .result-body {
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          background: var(--bg-color);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        .btn-x {
          width: 100%;
          background-color: #000000;
          color: white;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 10px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-retry {
          width: 100%;
          background-color: transparent;
          color: var(--text-color);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 10px;
          font-size: 14px;
          cursor: pointer;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
