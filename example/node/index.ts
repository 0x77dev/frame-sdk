import { Frame } from '@0x77/frame-sdk'
import { NobleTransport } from '@0x77/frame-sdk/dist/transport/noble'

const frame = new Frame({
  transport: new NobleTransport()
})

await frame.connect()

frame.onData.subscribe((data) => {
  console.log('data', data)
})

await frame.sendData("print('Hello, World!')")

setInterval(async () => {
  await frame.display.text({
    text: new Date().toLocaleTimeString(),
    x: 4,
    y: 4,
    color: 'WHITE',
    spacing: 4
  })

  await frame.display.show()
}, 1000)

// await frame.disconnect();
