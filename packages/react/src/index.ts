import { WebAudioCore } from '@webaudio/analyzer';
import { useEffect, useRef } from 'react';

export function useWebAudio() {
  const coreRef = useRef<WebAudioCore>(null);

  useEffect(() => {
    if (coreRef.current) {
      return;
    }

    coreRef.current = new WebAudioCore();

    return () => coreRef.current.disconnect();
  }, []);

  return {
    getSources: WebAudioCore.getSources,
    ref: coreRef.current
  };
}
