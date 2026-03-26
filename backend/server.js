const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to extract metadata and direct media URLs
app.post('/api/extract', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        console.log(`Extracting info for: ${url}`);
        
        // Use dump-json to get the raw metadata
        // Important flags: 
        // no-warnings: Cleaner output
        // default-search auto: helps with unsupported URLs
        // dump-json: outputs json info instead of downloading
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'
            ]
        });

        // Parse formats to ensure we send clean JSON to flutter
        const formats = output.formats.map(f => ({
            format_id: f.format_id,
            ext: f.ext,
            resolution: f.resolution || (f.width ? `${f.width}x${f.height}` : 'audio/unknown'),
            filesize: f.filesize || f.filesize_approx,
            url: f.url,
            vcodec: f.vcodec,
            acodec: f.acodec,
            quality: f.format_note || 'unknown',
            fps: f.fps
        })).filter(f => f.url); // only return formats with valid URLs

        const responseData = {
            id: output.id,
            title: output.title,
            thumbnail: output.thumbnail,
            duration: output.duration,
            extractor: output.extractor,
            formats: formats
        };

        res.json(responseData);

    } catch (error) {
        console.error('Extraction Error:', error);
        res.status(500).json({ 
            error: 'Failed to extract media details', 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Downloader backend running on port ${PORT}`);
});
