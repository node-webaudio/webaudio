import { AudioContext } from 'standardized-audio-context-mock';
import { DecibelMeter, createEvent } from './index';

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

describe('decibel-meter-ts', () => {
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

  describe('createEvent', () => {
    it('can create a custom event', () => {
      type Test = {
        correct: boolean;
      };
      const correct = true;

      const result = createEvent<Test>('event', { correct });

      expect(result).not.toBeNull();
      expect(result.detail.correct).toBe(correct);
    });
  });

  describe('DecibelMeter', () => {
    it('can be instantiated', () => {
      expect(new DecibelMeter(audioContext)).not.toBeNull();
    });

    describe('getSources', () => {
      it('works', async () => {
        enumerateDevices.mockResolvedValueOnce([{ kind: 'audioinput' }]);
        const result = await DecibelMeter.getSources();

        expect(Array.isArray(result)).toBeTruthy();
        expect(result).toHaveLength(1);
      });

      it('handle getUserMedia error', async () => {
        getUserMedia.mockImplementationOnce(() => {
          throw new Error('Failed');
        });
        const sources = await DecibelMeter.getSources();

        expect(sources).toHaveLength(0);
      });

      it('handles enumerateDevices error', async () => {
        getUserMedia.mockResolvedValueOnce(null);
        enumerateDevices.mockImplementationOnce(() => {
          throw new Error('Failed');
        });
        const sources = await DecibelMeter.getSources();

        expect(sources).toHaveLength(0);
      });
    });

    describe('connect', () => {
      it('works', async () => {
        getUserMedia.mockResolvedValueOnce(null);
        const meter = new DecibelMeter(audioContext);

        await meter.connect(deviceInfo);
        expect(meter.connected).toBeTruthy();
        expect(meter.source).not.toBeNull();
        expect(meter.analyzer).not.toBeNull();
      });

      it('handles already connected case', async () => {
        const meter = new DecibelMeter(audioContext);

        meter.connected = true;
        await meter.connect(deviceInfo);
        expect(getUserMedia).not.toHaveBeenCalled();
      });

      it('throws getUserMedia error', async () => {
        getUserMedia.mockImplementationOnce(() => {
          throw new Error('Failed');
        });
        const meter = new DecibelMeter(audioContext);

        expect(async () => {
          await meter.connect(deviceInfo);
        }).rejects.toThrow();
      });
    });

    describe('disconnect', () => {
      it('works', async () => {
        const meter = new DecibelMeter(audioContext);

        meter.connected = true;
        meter.analyzer = audioContext.createAnalyser();
        meter.disconnect();
        expect(meter.connected).toBeFalsy();
        // expect(meter.source).toBeNull();
        expect(meter.analyzer).toBeNull();
      });

      it('handles disconnected case', () => {
        const meter = new DecibelMeter(audioContext);

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
