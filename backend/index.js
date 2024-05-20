const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const { PythonShell } = require('python-shell');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

const transcribeAudio = async (audioStream, filePath) => {
    const writeStream = fs.createWriteStream(filePath);
    await pipeline(audioStream, writeStream);

    return new Promise((resolve, reject) => {
        PythonShell.run('transcribe.py', { args: [filePath] }, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
};

app.post('/api/transcript', async (req, res) => {
    const { url } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const audioStream = ytdl(url, { filter: 'audioonly' });
        const transcript = await transcribeAudio(audioStream, 'audio.mp3');

        res.json({ transcript });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process the video' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
