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
      } else {
        alert('エラーが発生しました: ' + (data.message || '通信エラー'));
      }
    } catch (error) {
      alert('サーバーに接続できませんでした。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎵 音楽MBTI診断</h1>
      
      {!result && !loading && (
        <form onSubmit={handleSubmit}>
          {[1, 2, 3].map((num) => (
            <div key={num} className="song-form">
              <h3>{num}曲目</h3>
              <input type="text" name={`artist${num}`} placeholder="アーティスト名" required onChange={handleChange} />
              <input type="text" name={`title${num}`} placeholder="曲名" required onChange={handleChange} />
              <div className="radio-group">
                <label><input type="radio" name={`point${num}`} value="メロディ" defaultChecked onChange={handleChange} /> メロディ</label>
                <label><input type="radio" name={`point${num}`} value="歌詞" onChange={handleChange} /> 歌詞</label>
              </div>
            </div>
          ))}
          <button type="submit" className="btn-submit">診断を実行する</button>
        </form>
      )}

      {loading && <div className="loading">解析中...</div>}

      {result && (
        <div className="result-card">
          <div className="result-body">{result}</div>
          <button className="btn-retry" onClick={() => setResult('')}>もう一度診断する</button>
        </div>
      )}

<style jsx>{`
        /* 全体設定 */
        .container {
          max-width: 100%; /* スマホ時は画面いっぱいに */
          width: 95%;      /* 少し余白を持たせる */
          margin: 0 auto;
          padding: 16px 8px;
          color: var(--text-main);
        }
        
        /* 診断結果のカード */
        #result-card {
          border-top: 4px solid var(--accent-color); /* 強調 */
          padding-top: 20px;
          margin-top: 24px;
        }
        
        .result-header {
          font-size: 20px; /* 少し大きく */
          margin-bottom: 16px;
        }
        
        .result-body {
          font-size: 16px; /* 文字サイズをスマホ向けに読みやすく */
          line-height: 1.8; /* 行間を広げて圧迫感をなくす */
          background: var(--bg-card);
          padding: 20px;
          border-radius: 12px;
        }

        /* ボタンのサイズもスマホで押しやすく調整 */
        .btn-x, .btn-retry {
          padding: 14px;
          font-size: 16px;
          margin-top: 12px;
        }

        /* 既存のフォームなどはそのまま維持 */
        .song-form { padding: 16px; margin-bottom: 16px; }
        .btn-submit { padding: 16px; font-size: 18px; }
      `}</style>
    </div>
  );
}
