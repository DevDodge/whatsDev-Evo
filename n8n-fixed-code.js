// Get data from previous nodes
const hasImageNodeData = $('hasImage').first().json;
const chatId = $('HTTP Request8').first().json.chatId;

// Get API credentials from Keys node
const apiKey = $('Keys').item.json['api-key'];
const deviceUuid = $('Keys').item.json['uuid'];

// ✅ FIXED: Correct base URL (removed /v1/messages)
const baseUrl = 'https://dk.whatsdeveloper.com/api';

// Common headers for all requests
const headers = {
    'Content-Type': 'application/json',
    'X-Device-UUID': deviceUuid,
    'X-API-Token': apiKey
};

// Delay between each message (5 seconds)
const DELAY_MS = 5000;

// Media file extensions
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.webm', '.mkv'];
const AUDIO_EXTENSIONS = ['.mp3', '.ogg', '.wav', '.m4a', '.opus', '.aac'];
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];

// Helper: detect media type from URL
function getMediaType(url) {
    try {
        const pathname = new URL(url).pathname.toLowerCase();
        if (IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext))) return 'image';
        if (VIDEO_EXTENSIONS.some(ext => pathname.endsWith(ext))) return 'video';
        if (AUDIO_EXTENSIONS.some(ext => pathname.endsWith(ext))) return 'audio';
        if (DOCUMENT_EXTENSIONS.some(ext => pathname.endsWith(ext))) return 'document';
    } catch (e) { }
    return null;
}

// Helper: split text into chunks of text and media URLs
function splitTextIntoSegments(text) {
    const urlRegex = /(https?:\/\/[^\s\n]+)/g;
    const segments = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
        const url = match[0];
        const mediaType = getMediaType(url);

        if (mediaType) {
            // Add text before this media URL (if any)
            const before = text.substring(lastIndex, match.index).trim();
            if (before) {
                segments.push({ type: 'text', content: before });
            }
            // Add the media URL
            segments.push({ type: mediaType, url: url });
            lastIndex = match.index + url.length;
        }
    }

    // Add remaining text after last media URL
    const remaining = text.substring(lastIndex).trim();
    if (remaining) {
        segments.push({ type: 'text', content: remaining });
    }

    return segments;
}

// Helper: send API request + delay
async function sendRequest(self, endpoint, bodyObj) {
    const response = await self.helpers.httpRequest({
        method: 'POST',
        url: `${baseUrl}${endpoint}`,
        headers: headers,
        body: JSON.stringify(bodyObj)
    });

    // Wait 5 seconds between messages
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));

    return response;
}

// Check if parts exist
if (!hasImageNodeData.parts || hasImageNodeData.parts.length === 0) {
    return [{ json: { success: false, error: "No parts found in the input data.", sent: 0 } }];
}

let sentCount = 0;
const results = [];

try {
    for (let i = 0; i < hasImageNodeData.parts.length; i++) {
        const part = hasImageNodeData.parts[i];

        // ========================================
        // 1. IMAGE part (explicit)
        // ========================================
        if (part.type === 'image' && part.hasImage && part.imageLink) {
            // ✅ FIXED: phone (not to), image (not imageUrl)
            await sendRequest(this, '/send-image', {
                phone: chatId,
                image: part.imageLink,
                caption: part.caption || ''
            });
            sentCount++;
            results.push({
                partIndex: i, type: 'image',
                imageUrl: part.imageLink,
                caption: part.caption || null,
                sent: true
            });
            continue;
        }

        // ========================================
        // 2. VIDEO part (explicit)
        // ========================================
        if (part.type === 'video') {
            const videoUrl = part.videoUrl || part.imageLink;
            if (videoUrl) {
                // ✅ FIXED: phone (not to), video (not videoUrl)
                await sendRequest(this, '/send-video', {
                    phone: chatId,
                    video: videoUrl,
                    caption: part.caption || ''
                });
                sentCount++;
                results.push({
                    partIndex: i, type: 'video',
                    videoUrl: videoUrl,
                    caption: part.caption || null,
                    sent: true
                });
            }
            continue;
        }

        // ========================================
        // 3. VOICE/AUDIO part (PTT)
        // ========================================
        if (part.type === 'voice' || part.type === 'audio') {
            const audioUrl = part.audioUrl || part.imageLink;
            if (audioUrl) {
                // ✅ FIXED: phone (not to), audio (not audioUrl)
                await sendRequest(this, '/send-audio', {
                    phone: chatId,
                    audio: audioUrl
                });
                sentCount++;
                results.push({
                    partIndex: i, type: 'voice',
                    audioUrl: audioUrl,
                    sent: true
                });
            }
            continue;
        }

        // ========================================
        // 3.5 DOCUMENT / PDF part (explicit)
        // ========================================
        if (part.type === 'document' || part.hasDocument) {
            const docUrl = part.documentUrl;
            if (docUrl) {
                const fixedFilename = 'OctoBot Services';

                // ✅ FIXED: phone (not to), document (not documentUrl)
                await sendRequest(this, '/send-document', {
                    phone: chatId,
                    document: docUrl,
                    fileName: fixedFilename
                });
                sentCount++;
                results.push({
                    partIndex: i,
                    type: 'document',
                    documentUrl: docUrl,
                    filename: fixedFilename,
                    sent: true
                });
            }
            continue;
        }

        // ========================================
        // 4. TEXT part — handles separators & media URLs
        // ========================================
        if (part.type === 'text' && part.text && part.text.trim()) {
            // Split text blocks dynamically by matching lines with 3 or more dashes (e.g. -----)
            const chunks = part.text.split(/\s*---+\s*/).map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);

            for (let c = 0; c < chunks.length; c++) {
                const chunk = chunks[c];
                const segments = splitTextIntoSegments(chunk);

                // If no media URLs found inside this specific section, fallback send as-is
                if (segments.length === 0) {
                    segments.push({ type: 'text', content: chunk });
                }

                for (let s = 0; s < segments.length; s++) {
                    const seg = segments[s];

                    if (seg.type === 'text') {
                        // ✅ FIXED: /send-message (not /send-text), phone (not to), message (not text)
                        await sendRequest(this, '/send-message', {
                            phone: chatId,
                            message: seg.content
                        });
                        sentCount++;
                        results.push({
                            partIndex: i,
                            chunkIndex: c,
                            segmentIndex: s,
                            type: 'text',
                            preview: seg.content.substring(0, 80) + (seg.content.length > 80 ? '...' : ''),
                            sent: true
                        });

                    } else if (seg.type === 'image') {
                        // ✅ FIXED: phone, image
                        await sendRequest(this, '/send-image', {
                            phone: chatId,
                            image: seg.url,
                            caption: ''
                        });
                        sentCount++;
                        results.push({
                            partIndex: i, chunkIndex: c, segmentIndex: s, type: 'image',
                            imageUrl: seg.url,
                            sent: true
                        });

                    } else if (seg.type === 'video') {
                        // ✅ FIXED: phone, video
                        await sendRequest(this, '/send-video', {
                            phone: chatId,
                            video: seg.url,
                            caption: ''
                        });
                        sentCount++;
                        results.push({
                            partIndex: i, chunkIndex: c, segmentIndex: s, type: 'video',
                            videoUrl: seg.url,
                            sent: true
                        });

                    } else if (seg.type === 'audio') {
                        // ✅ FIXED: phone, audio
                        await sendRequest(this, '/send-audio', {
                            phone: chatId,
                            audio: seg.url
                        });
                        sentCount++;
                        results.push({
                            partIndex: i, chunkIndex: c, segmentIndex: s, type: 'audio',
                            audioUrl: seg.url,
                            sent: true
                        });

                    } else if (seg.type === 'document') {
                        const fixedFilename = 'OctoBot Services';
                        // ✅ FIXED: phone, document
                        await sendRequest(this, '/send-document', {
                            phone: chatId,
                            document: seg.url,
                            fileName: fixedFilename
                        });
                        sentCount++;
                        results.push({
                            partIndex: i, chunkIndex: c, segmentIndex: s, type: 'document',
                            documentUrl: seg.url,
                            filename: fixedFilename,
                            sent: true
                        });
                    }
                }
            }
            continue;
        }
    }

    return [{
        json: {
            success: true,
            sent: sentCount,
            totalParts: hasImageNodeData.parts.length,
            chatId: chatId,
            partsProcessed: results,
            timestamp: new Date().toISOString()
        }
    }];

} catch (err) {
    console.error("WhatsDeveloper API Error:", err.response?.data || err.message);
    return [{
        json: {
            success: false,
            error: err.message,
            sent: sentCount,
            chatId: chatId,
            errorDetails: err.response?.data || null,
            timestamp: new Date().toISOString()
        }
    }];
}
