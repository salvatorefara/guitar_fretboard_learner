import * as Pitchfinder from "pitchfinder";

export const calculateRMS = (buffer) => {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
};

class PitchProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  constructor(options) {
    super();
    this.detectPitch = Pitchfinder.AMDF({
      sampleRate: options.processorOptions.sampleRate || 44100,
      minFrequency: 70,
      maxFrequency: 1500,
    });
  }

  process(inputs, outputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      console.log(channelData.length);
      const inputRMS = calculateRMS(channelData);
      const detectedPitch = this.detectPitch(channelData);

      this.port.postMessage({
        detectedPitch,
        inputRMS,
      });
    }
    return true;
  }
}

registerProcessor("pitch-processor", PitchProcessor);
