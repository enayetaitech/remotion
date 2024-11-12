import React from 'react';
import {Composition, getInputProps} from 'remotion';
import {MyComposition} from './Composition';


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
        inputProps={{
          trackItemIds: props.trackItemIds,
          trackItemsMap: props.trackItemsMap,
          tracks: props.tracks,
          fps: props.fps,
          transitionsMap: props.transitionsMap
        }}
      />
    </>
  );
};