"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bundler_1 = require("@remotion/bundler");
const renderer_1 = require("@remotion/renderer");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const promises_1 = __importDefault(require("fs/promises"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Create videos directory if it doesn't exist
const VIDEOS_DIR = path_1.default.join(process.cwd(), 'videos');
promises_1.default.mkdir(VIDEOS_DIR, { recursive: true }).catch(console.error);
// Serve static videos
app.use('/videos', express_1.default.static(VIDEOS_DIR));
// Store rendering status
const renderStatus = new Map();
// Store composition data temporarily
const compositionDataMap = new Map();
app.post('/render-video', async (req, res) => {
    try {
        // console.log('Received request to render video',req.body);
        const compositionData = req.body;
        const jobId = `job-${Date.now()}`;
        // Store the composition data
        compositionDataMap.set(jobId, compositionData);
        // console.log('compositionDataMap',compositionDataMap);
        // Update status to "processing"
        renderStatus.set(jobId, {
            status: 'processing',
            progress: 0,
        });
        // Start rendering process asynchronously
        renderVideo(jobId);
        res.json({
            jobId,
            status: 'processing',
            message: 'Video rendering started',
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to start video rendering',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
app.get('/render-status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const status = renderStatus.get(jobId) || { status: 'not_found' };
    res.json(status);
});
// render video function to finalize 
async function renderVideo(jobId) {
    try {
        const inputProps = compositionDataMap.get(jobId);
        const bundled = await (0, bundler_1.bundle)(path_1.default.join(process.cwd(), './src/remotion/index.ts'));
        // console.log('Bundle result:', {
        //   bundleSuccess: !!bundled,
        //   bundlePath: bundled
        // });
        const compositions = await (0, renderer_1.getCompositions)(bundled, {
            inputProps: {
                duration: inputProps.duration,
                fps: inputProps.fps,
                size: inputProps.size,
                trackItemIds: inputProps.trackItemIds,
                trackItemsMap: inputProps.trackItemsMap,
                tracks: inputProps.tracks
            }
        });
        // console.log('Raw compositions:line 77', compositions[0].props.size);
        // console.log('Type of compositions:line 78', typeof compositions);
        // console.log('Is Array?:line 79', Array.isArray(compositions));
        if (Array.isArray(compositions) && compositions.length > 0) {
            const firstComp = compositions[0];
            // console.log('First composition:', firstComp);
            // console.log('Properties of first composition:', Object.getOwnPropertyNames(firstComp));
        }
        // Then let's see what properties are actually available
        // console.log('First composition keys:', Object.keys(compositions[0]));
        const composition = compositions.find((c) => c.id === 'MyVideo');
        // console.log('Found MyVideo composition:', composition);
        if (!composition) {
            throw new Error('Composition not found. Available compositions: ' +
                compositions.map(c => c.id).join(', '));
        }
        const outputPath = path_1.default.join(VIDEOS_DIR, `${jobId}.mp4`);
        // console.log('Duration:line 89', inputProps.duration);
        // console.log('FPS:line 90', inputProps.fps);
        // console.log('Calculated frames:line 91', Math.round(inputProps.duration * inputProps.fps / 1000));
        // console.log('Complete inputProps:line 93', JSON.stringify(inputProps, null, 2));
        // console.log('Input Props before render:line 115', {
        //   trackItemIds: inputProps.trackItemIds,
        //   trackItemsMap: Object.keys(inputProps.trackItemsMap),
        //   tracks: JSON.stringify(inputProps.tracks, null, 2),
        // });
        // Add validation for required properties
        if (!inputProps.tracks || !Array.isArray(inputProps.tracks)) {
            throw new Error('Tracks must be an array');
        }
        if (!inputProps.trackItemsMap || typeof inputProps.trackItemsMap !== 'object') {
            throw new Error('TrackItemsMap must be an object');
        }
        // console.log('Final render configuration:', {
        //   composition: composition.id,
        //   outputPath,
        //   inputProps: {
        //     trackItemIds: inputProps.trackItemIds?.length,
        //     trackItemsMapKeys: Object.keys(inputProps.trackItemsMap),
        //     tracksCount: inputProps.tracks?.length,
        //     fps: inputProps.fps,
        //     size: inputProps.size,
        //     duration: inputProps.duration,
        //     durationInFrames: Math.ceil(inputProps.duration / (1000 / inputProps.fps)),
        //     transitionsMap: inputProps.transitionsMap,
        //     transitionIds: inputProps.transitionIds
        //   }
        // });
        await (0, renderer_1.renderMedia)({
            composition,
            serveUrl: bundled,
            codec: 'h264',
            outputLocation: outputPath,
            inputProps: {
                trackItemIds: inputProps.trackItemIds,
                trackItemsMap: inputProps.trackItemsMap,
                tracks: inputProps.tracks,
                fps: inputProps.fps,
                size: inputProps.size,
                duration: inputProps.duration,
                durationInFrames: Math.ceil(inputProps.duration / (1000 / inputProps.fps)),
                transitionsMap: inputProps.transitionsMap,
                transitionIds: inputProps.transitionIds
            },
            onProgress: ({ progress }) => {
                renderStatus.set(jobId, {
                    status: 'processing',
                    progress: Math.floor(progress * 100),
                });
            },
        });
        const videoUrl = `/videos/${jobId}.mp4`;
        renderStatus.set(jobId, {
            status: 'complete',
            progress: 100,
            url: videoUrl,
        });
        // Clean up composition data
        compositionDataMap.delete(jobId);
    }
    catch (error) {
        console.error('Rendering error:', error);
        renderStatus.set(jobId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        compositionDataMap.delete(jobId);
    }
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
