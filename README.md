# frame-sdk

Unofficial JavaScript / [Web Bluetooth](https://github.com/WebBluetoothCG/web-bluetooth) SDK for [Brilliant Labs Frame](https://docs.brilliant.xyz/frame/building-apps) with support for Browser and Node.js.

_(Work in progress for React Native support)_

## Usage

### Initialize

```ts
import { Frame } from "frame-sdk";

const frame = new Frame();
```

### Connect

```ts
await frame.connect();
```

### Disconnect

```ts
await frame.disconnect();
```

### Receive Data

```ts
frame.onData.subscribe((data) => {
  console.log(data);
});
```

### Send Lua Code

```ts
await frame.eval("print('Hello, World!')");
```

## Examples

### Vite

Look into [example/vite](./example/vite) for a full example.

### Node.js

```ts
import { Frame } from "frame-sdk";
import { Bluetooth } from "webbluetooth";

const frame = new Frame({
  bluetooth: Bluetooth,
});
```

Look into [example/node](./example/node) for a full example.

### React Native

Work in progress, not a priority since React Native doesn't support Web Bluetooth natively, bu there is [react-native-ble-manager](https://innoveit.github.io/react-native-ble-manager) that has been used by [Neurosity for their RN SDK](https://docs.neurosity.co/docs/api/bluetooth-react-native/).
