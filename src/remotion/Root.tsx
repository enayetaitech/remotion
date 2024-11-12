import React from 'react';
import {Composition, getInputProps} from 'remotion';
import {MyComposition} from './Composition';

// interface InputProps {
//   duration: number;
//   fps: number;
//   size: {
//     width: number;
//     height: number;
//   };
//   trackItemIds: string[];
//   trackItemsMap: Record<string, any>;
//   tracks: any[];
// }

export const RemotionRoot: React.FC = () => {
  const props = getInputProps();
  console.log('props in Root.tsx',props);
  const durationInFrames = Math.ceil(props.duration / (1000 / props.fps));
  
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyComposition}
        durationInFrames={durationInFrames}
        fps={props.fps}
        width={props.size.width}
        height={props.size.height}
        defaultProps={{
          trackItemIds: props.trackItemIds,
          trackItemsMap: props.trackItemsMap,
          tracks: props.tracks,
          fps: props.fps
        }}
      />
    </>
  );
};