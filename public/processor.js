class MyProcessor extends AudioWorkletProcessor {
  constructor() {
      super();
      this.port.onmessage = this.handleMessage.bind(this);
  }
  handleMessage(event) {
  }
  process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
      if (input.length > 0) {
          const inputChannelData = input[0];
          const outputChannelData = output[0];
          for (let i = 0; i < inputChannelData.length; i++) {
              outputChannelData[i] = inputChannelData[i];
          }
          this.port.postMessage(inputChannelData.buffer);
      }
      return true;
  }
}

registerProcessor('my-processor', MyProcessor);
