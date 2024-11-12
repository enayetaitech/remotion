import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, Video, useVideoConfig, useCurrentFrame} from 'remotion';

const TrackItem: React.FC<{
  item: any;
  startFrame: number;
  endFrame: number;
  fps: number;
}> = ({item, startFrame, endFrame, fps}) => {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  const transitionsMap = config?.inputProps?.transitionsMap || {};
  
  // Find transitions where this item is the source or target
  const incomingTransition = Object.values(transitionsMap).find(
    (t: any) => t.toId === item.id
  );
  const outgoingTransition = Object.values(transitionsMap).find(
    (t: any) => t.fromId === item.id
  );

  // Calculate opacity based on transitions
  let opacity = (item.details.opacity || 100) / 100;
  
  if (incomingTransition) {
    const transitionStartFrame = Math.round(
      item.display.from / (1000 / fps)
    );
    const transitionDurationFrames = Math.round(
      incomingTransition.duration / (1000 / fps)
    );
    
    if (frame < transitionStartFrame + transitionDurationFrames) {
      opacity *= (frame - transitionStartFrame) / transitionDurationFrames;
    }
  }

  if (outgoingTransition) {
    const transitionStartFrame = Math.round(
      (item.display.to - outgoingTransition.duration) / (1000 / fps)
    );
    const transitionDurationFrames = Math.round(
      outgoingTransition.duration / (1000 / fps)
    );
    
    if (frame > transitionStartFrame) {
      opacity *= 1 - (frame - transitionStartFrame) / transitionDurationFrames;
    }
  }

  const style = {
    position: 'absolute' as const,
    top: item.details.top || 0,
    left: item.details.left || 0,
    transform: item.details.transform || 'none',
    opacity,
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
          startFrom={Math.round((item.trim?.from || 0) / (1000 / fps))}
          endAt={Math.round((item.trim?.to || item.details.duration) / (1000 / fps))}
        />
      );
    case 'audio':
      return (
        <Audio
          src={item.details.src}
          volume={(item.details.volume || 100) / 100}
        />
      );
    case 'text':
      return (
        <div style={{
          ...style,
          fontFamily: item.details.fontFamily,
          fontSize: `${item.details.fontSize}px`,
          fontWeight: item.details.fontWeight,
          fontStyle: item.details.fontStyle,
          textDecoration: item.details.textDecoration,
          textAlign: item.details.textAlign,
          lineHeight: item.details.lineHeight,
          letterSpacing: item.details.letterSpacing,
          wordSpacing: item.details.wordSpacing,
          color: item.details.color,
          backgroundColor: item.details.backgroundColor,
          wordWrap: item.details.wordWrap,
          wordBreak: item.details.wordBreak,
          WebkitTextStrokeColor: item.details.WebkitTextStrokeColor,
          WebkitTextStrokeWidth: item.details.WebkitTextStrokeWidth,
        }}>
          {item.details.text}
        </div>
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
                  fps={fps}
                />
              </Sequence>
            );
          })}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};