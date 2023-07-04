import { AudioAnalyzer } from '@webaudio/analyzer';
import { useEffect, useState } from 'react';

export function useAudioAnalyzer() {
  const [analyzer, setAnalyzer] = useState<AudioAnalyzer>(null);
  const [sources, setSources] = useState<MediaDeviceInfo[]>([]);

  async function updateSources() {
    setSources(await AudioAnalyzer.getSources());
  }

  useEffect(() => {
    setAnalyzer(new AudioAnalyzer());
    updateSources();
  }, []);

  return {
    analyzer,
    sources,
    updateSources
  };
}
