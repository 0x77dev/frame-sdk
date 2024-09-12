# frame-sdk

[![npm](https://img.shields.io/npm/v/@0x77/frame-sdk.svg)](https://www.npmjs.com/package/@0x77/frame-sdk)

![Standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)

JavaScript SDK for [Brilliant Labs Frame](https://docs.brilliant.xyz/frame/building-apps) with support for Browser and Node.js

_(Work in progress for React Native support)_

## Examples

- [Node.js / Bun](./example/node/index.ts)
- [Browser](./example/vite/src/main.ts)

## Usage

### Initialize

```ts
import { Frame } from "@0x77/frame-sdk";

const frame = new Frame();
```

Or using a custom Bluetooth implementation:

```ts
import { Frame } from "@0x77/frame-sdk";
import { NobleTransport } from "@0x77/frame-sdk/dist/transport/noble";

const frame = new Frame({
  transport: new NobleTransport(),
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
