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

      <style jsx global>{`
        body { background: #0d1117; color: #c9d1d9; font-family: sans-serif; margin: 0; padding: 10px; }
        .container { max-width: 500px; margin: 0 auto; }
        h1 { text-align: center; font-size: 20px; color: #f0f6fc; }
        .song-form { background: #161b22; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
        input { width: 100%; padding: 10px; margin: 5px 0; border-radius: 4px; border: 1px solid #30363d; background: #0d1117; color: white; box-sizing: border-box; }
        .radio-group { display: flex; gap: 15px; margin-top: 10px; font-size: 14px; }
        .btn-submit { width: 100%; padding: 15px; background: #238636; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .loading { text-align: center; padding: 20px; }
        .result-card { background: #161b22; padding: 20px; border-radius: 8px; }
        .result-body { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
        .btn-retry { width: 100%; padding: 10px; margin-top: 15px; background: #30363d; color: white; border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
    </div>
  );
}
