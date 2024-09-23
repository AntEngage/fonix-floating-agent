# @antengage/fonix-floating-agent

A flexible chat and webcall SDK with a floating chat button. This package allows you to easily integrate a chat and webcall features of [AntEngage](https://antengage.com) platform into your JS application, complete with a customizable floating chat button and audio processing capabilities.

## Features

- Customizable floating chat button.
- Seamless integration with React applications.
- Audio processing capabilities via `processor.js`.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/get-npm) (or [yarn](https://yarnpkg.com/getting-started))

## Installation

To install the package, run the following command:

```bash
npm install @antengage/fonix-floating-agent
```

## Usage

After installing the SDK, you can import and use it in your JS application as follows:

```javascript
import FloatingChat from "@antengage/fonix-floating-agent";

function App() {
  return (
    <div>
      <FloatingChat
        ae_domain="<DOMAIN>"             // http://fonix.ai/xyz-ooo
        botId="<BOT_ID>"                 // ****-****-****
        token="<AUTH_TOKEN>"            // *************=
        licenseToken="<LICENSE_TOKEN>"  // **************
      />
    </div>
  );
}

export default App;
```

### Adding `processor.js` to the Public Folder

For audio processing to work, you need to add a file named `processor.js` in your application's `public` folder. This file enables the audio worklet for handling real-time audio input/output in your chat application.

#### Steps:

1. Create a file called `processor.js` in the `public` directory of your React project.
   
   Example path:
   ```
   your-project/public/processor.js
   ```

2. Add the following code to `processor.js`:

```javascript
class MyProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {}

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
```

This script will handle audio input/output processing for the chat SDK. The `MyProcessor` class is an `AudioWorkletProcessor`, and it's registered as `'my-processor'`. This allows your chat application to process audio data in real-time.


### Adding `ae-logo.png` to the Public Folder

You can add your company's logo in your project's public folder and the logo name should be `ae-logo.png` and size should be 20x20 to 50x50.

## License

This package is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

---

Feel free to [open an issue](https://github.com/AntEngage/fonix-floating-agent/issues) or submit a pull request if you encounter any issues or want to contribute to the project.
