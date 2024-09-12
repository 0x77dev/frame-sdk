import debug from 'debug'
import { SimpleEventDispatcher } from 'strongly-typed-events'

const log = debug('frame-sdk')

interface FrameOptions {
  bluetooth?: Bluetooth;
}

export class Frame {
  private _onData = new SimpleEventDispatcher<string>()
  private device: BluetoothDevice | null = null
  private server: BluetoothRemoteGATTServer | null = null
  private service: BluetoothRemoteGATTService | null = null
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null

  private readonly SERVICE_UUID = '7a230001-5475-a6a4-654c-8431f6ad49c4'
  private readonly TX_CHARACTERISTIC_UUID =
    '7a230002-5475-a6a4-654c-8431f6ad49c4'

  private readonly RX_CHARACTERISTIC_UUID =
    '7a230003-5475-a6a4-654c-8431f6ad49c4'

  constructor (public options: FrameOptions = {}) {
    if (!options.bluetooth) {
      const nativeBluetooth =
        typeof navigator !== 'undefined' && navigator.bluetooth

      if (!nativeBluetooth) {
        throw new Error(
          'Bluetooth is not supported in this environment, please specify options.bluetooth for custom implementation'
        )
      }

      this.options.bluetooth = nativeBluetooth
    }
  }

  async connect (): Promise<void> {
    log('Requesting Bluetooth device...')
    this.device = await this.options.bluetooth!.requestDevice({
      filters: [{ namePrefix: 'Frame' }],
      optionalServices: [this.SERVICE_UUID]
    })

    log('Connecting to GATT server...')
    this.server = await this.device.gatt!.connect()

    log('Getting primary service...')
    this.service = await this.server.getPrimaryService(this.SERVICE_UUID)

    log('Getting characteristics...')
    const characteristics = await this.service.getCharacteristics()
    log('Characteristics:', characteristics)
    this.txCharacteristic = await this.service.getCharacteristic(
      this.TX_CHARACTERISTIC_UUID
    )
    this.rxCharacteristic = await this.service.getCharacteristic(
      this.RX_CHARACTERISTIC_UUID
    )

    log('Starting notifications...')
    await this.rxCharacteristic.startNotifications()
    this.rxCharacteristic.addEventListener(
      'characteristicvaluechanged',
      this.handleData
    )

    log('Connected to Frame')
  }

  async disconnect (): Promise<void> {
    if (this.device && this.device.gatt!.connected) {
      await this.device.gatt!.disconnect()
      log('Disconnected from Frame')
    }
  }

  private handleData = (event: Event): void => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value
    if (!value) {
      return
    }

    const decoder = new TextDecoder('utf-8')
    const data = decoder.decode(value)
    log('Received data:', data)
    this._onData.dispatch(data)
  }

  public get onData () {
    return this._onData.asEvent()
  }

  async eval (lua: string): Promise<void> {
    if (!this.txCharacteristic || !this.rxCharacteristic) {
      throw new Error('Not connected to Frame')
    }

    const encoder = new TextEncoder()
    const command = encoder.encode(lua)
    await this.txCharacteristic.writeValue(command)
  }
}
