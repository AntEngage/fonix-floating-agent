Here’s the Markdown code for the updated README:

```md
# @antengage/fonix-floating-agent

A flexible chat SDK with a floating chat button. This package allows you to easily integrate a chat feature into your React application with a customizable floating chat button.

## Features

- Customizable floating chat button.
- Seamless integration with React applications.
- Audio processing capabilities via `processor.js`.

## Installation

To install the package, run the following command:

```bash
npm install @antengage/fonix-floating-agent
```

## Usage

After installing the SDK, you can import and use it in your React application:

```javascript
import FloatingChat from "@antengage/fonix-floating-agent";

function App() {
  return (
    <div>
      <FloatingChat
        host=""
        port=""
        conversationId=""
        callerName=""
        phoneNumber=""
        ariClient=""
        token="<AUTH_TOKEN>"
        actionPrompt=""
        callDirection=""
        />
    </div>
  );
}

export default App;
```

### Adding `processor.js` to the Public Folder

For audio worklet support, you need to add a file named `processor.js` in your application's `public` folder. This is necessary for handling audio input/output in your chat application.

**Steps:**

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

This script will handle audio input/output processing for the chat SDK. The `MyProcessor` class is an `AudioWorkletProcessor`, and it's registered as `'my-processor'`. This will allow your chat application to process audio data in real-time.

## License

This package is licensed under the MIT License.
```

You can copy and paste this Markdown code into your README file. Let me know if you need further adjustments!