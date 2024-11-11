import React from 'react';
import {Composition} from 'remotion';
import {MyComposition} from './Composition';

interface InputProps {
  duration: number;
  fps: number;
  size: {
    width: number;
    height: number;
  };
  trackItemIds: string[];
  trackItemsMap: Record<string, any>;
  tracks: any[];
}

export const RemotionRoot: React.FC<{
  inputProps: InputProps;
}> = ({ inputProps }) => {
  const durationInFrames = Math.ceil(inputProps.duration / (1000 / inputProps.fps));
  
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyComposition}
        durationInFrames={durationInFrames}
        fps={inputProps.fps}
        width={inputProps.size.width}
        height={inputProps.size.height}
        defaultProps={{
          trackItemIds: inputProps.trackItemIds,
          trackItemsMap: inputProps.trackItemsMap,
          tracks: inputProps.tracks,
          fps: inputProps.fps
        }}
      />
    </>
  );
};