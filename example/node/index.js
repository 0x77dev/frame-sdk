import { Frame } from "frame-sdk";
import { bluetooth } from "webbluetooth";

const frame = new Frame({
  bluetooth,
});

await frame.connect();

frame.onData.subscribe((data) => {
  console.log(data);
});

await frame.eval("print('Hello, World!')");

// await frame.disconnect();
