import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, Video, useVideoConfig} from 'remotion';

const TrackItem: React.FC<{
  item: any;
  startFrame: number;
  endFrame: number;
}> = ({item, startFrame, endFrame}) => {
  const style = {
    position: 'absolute' as const,
    top: item.details.top || 0,
    left: item.details.left || 0,
    transform: item.details.transform || 'none',
    opacity: (item.details.opacity || 100) / 100,
    width: item.details.width ? `${item.details.width}px` : 'auto',
    height: item.details.height ? `${item.details.height}px` : 'auto',
  };

  switch (item.type) {
    case 'image':
      return <Img src={item.details.src} style={style} />;
    case 'video':
      return (
        <Video
          src={item.details.src}
          style={style}
          volume={(item.details.volume || 100) / 100}
        />
      );
    case 'audio':
      return (
        <Audio
          src={item.details.src}
          volume={(item.details.volume || 100) / 100}
        />
      );
    default:
      return null;
  }
};

export const MyComposition: React.FC<{
  trackItemIds: string[];
  trackItemsMap: Record<string, any>;
  tracks: any[];
  fps: number;
}> = ({trackItemIds, trackItemsMap, tracks, fps}) => {
  console.log('MyComposition received props:', {
    trackItemIds,
    trackItemsMap: Object.keys(trackItemsMap),
    tracks,
    fps
  });

  if (!tracks || !Array.isArray(tracks)) {
    console.error('Tracks is undefined or not an array');
    return null;
  }

  return (
    <AbsoluteFill>
      {tracks.map((track) => (
        <React.Fragment key={track.id}>
          {track.items?.map((itemId) => {
            const item = trackItemsMap[itemId];
            if (!item) return null;
            
            const startFrame = Math.round(item.display.from / (1000 / fps));
            const endFrame = Math.round(item.display.to / (1000 / fps));
            
            return (
              <Sequence
                key={item.id}
                from={startFrame}
                durationInFrames={endFrame - startFrame}
              >
                <TrackItem
                  item={item}
                  startFrame={startFrame}
                  endFrame={endFrame}
                />
              </Sequence>
            );
          })}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};