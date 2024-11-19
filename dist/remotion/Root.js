"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemotionRoot = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const Composition_1 = require("./Composition");
const RemotionRoot = () => {
    const props = (0, remotion_1.getInputProps)();
    console.log('props in Root.tsx', props);
    const durationInFrames = Math.ceil(props.duration / (1000 / props.fps));
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "MyVideo", component: Composition_1.MyComposition, durationInFrames: durationInFrames, fps: props.fps, width: props.size.width, height: props.size.height, inputProps: {
                trackItemIds: props.trackItemIds,
                trackItemsMap: props.trackItemsMap,
                tracks: props.tracks,
                fps: props.fps,
                transitionsMap: props.transitionsMap
            } }) }));
};
exports.RemotionRoot = RemotionRoot;
