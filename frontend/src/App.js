import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import API_BASE_URL from './config';

function App() {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/transcript`, { url });
      setTranscript(response.data.transcript);
    } catch (error) {
      setError('Failed to fetch transcript. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>YapTube Transcript Generator</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL"
          />
          <button type="submit" disabled={loading}>Generate Transcript</button>
        </form>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {transcript && (
          <div className="transcript">
            <h2>Transcript</h2>
            <pre>{transcript}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
