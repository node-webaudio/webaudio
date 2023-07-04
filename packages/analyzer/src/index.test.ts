import { AudioContext } from 'standardized-audio-context-mock';
import { AudioAnalyzer } from './index';

const audioContext = new AudioContext();
const enumerateDevices = jest.fn();
const getUserMedia = jest.fn();
const requestAnimationFrame = jest.fn();
const cancelAnimationFrame = jest.fn();

const deviceInfo: MediaDeviceInfo = {
  deviceId: '1234',
  groupId: '123',
  kind: 'audioinput',
  label: 'Nope',
  toJSON() {
    return '';
  }
};

describe('@webaudio/analyzer', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      writable: true,
      value: {
        cancelAnimationFrame,
        requestAnimationFrame
      }
    });
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices,
        getUserMedia
      }
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('WebAudioCore', () => {
    it('can be instantiated', () => {
      expect(new AudioAnalyzer(audioContext)).not.toBeNull();
    });

    describe('getSources', () => {
      it('works', async () => {
        enumerateDevices.mockResolvedValueOnce([{ kind: 'audioinput' }]);
        const result = await AudioAnalyzer.getSources();

        expect(Array.isArray(result)).toBeTruthy();
        expect(result).toHaveLength(1);
      });

      it('handle getUserMedia error', async () => {
        getUserMedia.mockImplementationOnce(() => {
          throw new Error('Failed');
        });
        const sources = await AudioAnalyzer.getSources();

        expect(sources).toHaveLength(0);
      });

      it('handles enumerateDevices error', async () => {
        getUserMedia.mockResolvedValueOnce(null);
        enumerateDevices.mockImplementationOnce(() => {
          throw new Error('Failed');
        });
        const sources = await AudioAnalyzer.getSources();

        expect(sources).toHaveLength(0);
      });
    });

    describe('connect', () => {
      it('works', async () => {
        getUserMedia.mockResolvedValueOnce(null);
        const meter = new AudioAnalyzer(audioContext);

        await meter.connect(deviceInfo);
        expect(meter.connected).toBeTruthy();
        expect(meter.source).not.toBeNull();
        expect(meter.analyzer).not.toBeNull();
      });

      it('handles already connected case', async () => {
        const meter = new AudioAnalyzer(audioContext);

        meter.connected = true;
        await meter.connect(deviceInfo);
        expect(getUserMedia).not.toHaveBeenCalled();
      });

      it('throws getUserMedia error', async () => {
        getUserMedia.mockImplementationOnce(() => {
          throw new Error('Failed');
        });
        const meter = new AudioAnalyzer(audioContext);

        expect(async () => {
          await meter.connect(deviceInfo);
        }).rejects.toThrow();
      });
    });

    describe('disconnect', () => {
      it('works', async () => {
        const meter = new AudioAnalyzer(audioContext);

        meter.connected = true;
        meter.analyzer = audioContext.createAnalyser();
        meter.disconnect();
        expect(meter.connected).toBeFalsy();
        expect(meter.analyzer).toBeNull();
      });

      it('handles disconnected case', () => {
        const meter = new AudioAnalyzer(audioContext);

        meter.disconnect();
        expect(cancelAnimationFrame).not.toHaveBeenCalled();
        expect(meter.connected).toBeFalsy();
      });

      // it('stops listening during disconnect', () => {});
    });

    // describe('listen', () => {});

    // describe('stopListening', () => {});

    // describe('update', () => {});
  });
});
