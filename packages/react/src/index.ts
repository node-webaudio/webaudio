import {
  AudioAnalyzer,
  AudioKind,
  SpectrumEvent,
  VolumeEvent
} from '@webaudio/analyzer';
import { useCallback, useEffect, useState } from 'react';

export function useAudioSources(kind: AudioKind = 'audioinput') {
  const [sources, setSources] = useState<MediaDeviceInfo[]>([]);

  const refresh = useCallback(
    async () => setSources(await AudioAnalyzer.getSources(kind)),
    []
  );

  useEffect(() => {
    refresh();
  }, []);

  return {
    sources,
    refresh
  };
}

export function useAudioAnalyzer() {
  const [analyzer, setAnalyzer] = useState<AudioAnalyzer>(null);

  useEffect(() => {
    const newAnalyzer = new AudioAnalyzer();
    setAnalyzer(newAnalyzer);
  }, []);

  return analyzer;
}

export function useVolume(
  analyzer: AudioAnalyzer,
  handler: (event: VolumeEvent) => void
) {
  useEffect(() => {
    if (!analyzer) {
      return;
    }

    analyzer.on('volume', handler);

    return () => {
      analyzer.off('volume', handler);
    };
  }, [analyzer]);
}

export function useSpectrum(
  analyzer: AudioAnalyzer,
  handler: (event: SpectrumEvent) => void
) {
  useEffect(() => {
    if (!analyzer) {
      return;
    }

    analyzer.on('spectrum', handler);

    return () => {
      analyzer.off('spectrum', handler);
    };
  }, [analyzer]);
}
