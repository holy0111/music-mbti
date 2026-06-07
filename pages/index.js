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

    // 送信する直前に、画面の選択状態（point1~3）がちゃんと入っているか再確認・補正する
    const sendingData = {
      ...formData,
      point1: formData.point1 || 'メロディ',
      point2: formData.point2 || 'メロディ',
      point3: formData.point3 || 'メロディ'
    };

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendingData)
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
    const shareText = `${result}\n\n#3曲でわかる音楽MBTI性格診断\n`;
    const encodedText = encodeURIComponent(shareText);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="container">
      <h1>🎵 3曲でわかる音楽MBTI性格診断</h1>
      <p className="subtitle">あなたの好きな3曲から、心の奥底にある音楽精神とMBTIタイプを導き出します。</p>

      <form onSubmit={handleSubmit}>
        {[1, 2, 3].map((num) => (
          <div key={num} className="song-form">
            <h2>{num}曲目</h2>
            <div className="input-group">
              <label>アーティスト名</label>
              <input
                type="text"
                name={`artist${num}`}
                value={formData[`artist${num}`]}
                onChange={handleChange}
                placeholder="例: ぜんぶ君のせいだ。"
                required={num === 1}
              />
            </div>
            <div className="input-group">
              <label>曲名</label>
              <input
                type="text"
                name={`title${num}`}
                value={formData[`title${num}`]}
                onChange={handleChange}
                placeholder="例: 僕喰賜君ノ全ヲ"
                required={num === 1}
              />
            </div>
            <div className="input-group">
              <label>この曲のどこが好き？</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name={`point${num}`} 
                    value="メロディ" 
                    checked={formData[`point${num}`] === 'メロディ'} 
                    onChange={handleChange} 
                  /> メロディが好き
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name={`point${num}`} 
                    value="歌詞" 
                    checked={formData[`point${num}`] === '歌詞'} 
                    onChange={handleChange} 
                  /> 歌詞が好き
                </label>
              </div>
            </div>
          </div>
        ))}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? <span className="spinner"></span> : '診断を実行する'}
        </button>
      </form>

      {result && (
        <div id="result-card">
          <div className="result-header">🎉 あなたの音楽精神分析結果</div>
          <div className="result-body">{result}</div>
          <button onClick={handleShare} className="btn-x">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            結果をXでポストする
          </button>
          <button onClick={() => window.location.reload()} className="btn-retry">
            もう一度診断する
          </button>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px 16px;
          color: var(--text-main);
        }
        h1 {
          text-align: center;
          font-size: 24px;
          margin-bottom: 8px;
        }
        .subtitle {
          text-align: center;
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 32px;
        }
        .song-form {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .song-form h2 {
          font-size: 16px;
          margin-bottom: 16px;
          border-left: 4px solid var(--accent-color);
          padding-left: 8px;
        }
        .input-group {
          margin-bottom: 16px;
        }
        .input-group:last-child {
          margin-bottom: 0;
        }
        label {
          display: block;
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        input[type="text"] {
          width: 100%;
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-color);
          color: var(--text-main);
          font-size: 14px;
        }
        .radio-group {
          display: flex;
          gap: 16px;
          margin-top: 4px;
        }
        .radio-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: normal;
        }
        .radio-label input {
          cursor: pointer;
          width: 16px;
          height: 16px;
        }
        .btn-submit {
          width: 100%;
          background-color: var(--accent-color);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
        }
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        #result-card {
          border-top: 2px solid var(--accent-color);
          padding-top: 16px;
          margin-top: 32px;
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
          background: var(--bg-card);
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
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 10px;
          font-size: 14px;
          cursor: pointer;
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
}
