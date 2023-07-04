import { AudioAnalyzer } from '@webaudio/analyzer';
import { useEffect, useRef } from 'react';

export function useAudioAnalyzer() {
  const coreRef = useRef<AudioAnalyzer>(null);

  useEffect(() => {
    if (coreRef.current) {
      return;
    }

    coreRef.current = new AudioAnalyzer();

    return () => coreRef.current.disconnect();
  }, []);

  return {
    getSources: AudioAnalyzer.getSources,
    analyzer: coreRef.current
  };
}
