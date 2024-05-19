import React, {useEffect, useRef} from 'react';
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  videoSrc: string
  playing?: boolean
  onProgress?: (played: number) => void
}

export default function VideoPlayer(props: VideoPlayerProps) {
  const {videoSrc} = props;
  return (
    <ReactPlayer
      url={videoSrc}
      controls={true}
      style={{
        borderRadius: '8px'
      }}
      playing={props.playing}
      width={'100%'}
      height={'100%'}
      onReady={() => {
        // console.log('video player ready')
      }}
      onStart={() => {
        // console.log('video player start')
      }}
      onPlay={() => {
        // console.log('video player play')
      }}
      onProgress={(state) => {
        props.onProgress(state.playedSeconds)
      }}
    />
  );
}
