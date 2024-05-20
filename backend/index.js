const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const fs = require('fs');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

const transcribeAudio = async (audioStream) => {
    // Save audio to a file for transcription
    const filePath = './audio.mp3';
    const writeStream = fs.createWriteStream(filePath);
    await pipeline(audioStream, writeStream);

    // Use Whisper model for transcription
    return new Promise((resolve, reject) => {
        exec(`whisper ${filePath} --model base --language en`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                const transcript = fs.readFileSync(`${filePath}.txt`, 'utf-8');
                fs.unlinkSync(filePath); // Clean up audio file
                fs.unlinkSync(`${filePath}.txt`); // Clean up transcript file
                resolve(transcript);
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
        const transcript = await transcribeAudio(audioStream);

        res.json({ transcript });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process the video' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
