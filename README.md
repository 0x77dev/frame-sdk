# frame-sdk

Unofficial JavaScript / [Web Bluetooth](https://github.com/WebBluetoothCG/web-bluetooth) SDK for [Brilliant Labs Frame](https://docs.brilliant.xyz/frame/building-apps) with support for Browser and Node.js.

_(Work in progress for React Native support)_

## Usage

### Initialize

```ts
import { Frame } from "frame-sdk";
import { WebBluetoothTransport } from "frame-sdk/transport/web-bluetooth";

const frame = new Frame({
  transport: new WebBluetoothTransport(),
});
```

### Connect

```ts
await frame.connect();
```

### Disconnect

```ts
await frame.disconnect();
```

### Display Text

```ts
await frame.display.text({ text: "hello world" });
await frame.display.show();
```

### Receive Data

```ts
frame.onData.subscribe((data: string) => {
  console.log(data);
});
```

### Send Lua Code

```ts
await frame.sendData("print('Hello, World!')");
```
