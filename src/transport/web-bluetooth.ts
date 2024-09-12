import debug from 'debug'
import { SimpleEventDispatcher } from 'strongly-typed-events'
import { FrameConnectionError, FrameNotConnectedError } from '../errors'
import {
  RX_CHARACTERISTIC_UUID,
  SERVICE_UUID,
  TX_CHARACTERISTIC_UUID
} from './constants'
import type { Transport } from './schema'

const log = debug('frame-sdk:web-bluetooth')

export class WebBluetoothTransport implements Transport {
  private bluetooth: Bluetooth
  private _onData = new SimpleEventDispatcher<string>()
  private device: BluetoothDevice | null = null
  private server: BluetoothRemoteGATTServer | null = null
  private service: BluetoothRemoteGATTService | null = null
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null

  constructor (bluetooth?: Bluetooth) {
    const isNative = typeof window !== 'undefined' && 'Bluetooth' in window

    if (!isNative && !bluetooth) {
      throw new FrameConnectionError(
        'WebBluetooth is not supported in this environment, specify a custom Bluetooth implementation'
      )
    }

    this.bluetooth = bluetooth ?? window.navigator.bluetooth
  }

  async connect (): Promise<void> {
    log('Requesting Bluetooth device...')
    this.device = await this.bluetooth!.requestDevice({
      filters: [{ namePrefix: 'Frame' }],
      optionalServices: [SERVICE_UUID]
    })

    log('Connecting to GATT server...')
    this.server = await this.device.gatt!.connect()

    log('Getting primary service...')
    this.service = await this.server.getPrimaryService(SERVICE_UUID)

    log('Getting characteristics...')
    const characteristics = await this.service.getCharacteristics()
    log('characteristics', characteristics)

    this.txCharacteristic = await this.service.getCharacteristic(
      TX_CHARACTERISTIC_UUID
    )

    this.rxCharacteristic = await this.service.getCharacteristic(
      RX_CHARACTERISTIC_UUID
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
    if (this.rxCharacteristic) {
      this.rxCharacteristic.removeEventListener(
        'characteristicvaluechanged',
        this.handleData
      )
    }

    if (this.device?.gatt) {
      await this.device.gatt.disconnect()
    }

    this.device = null
    this.server = null
    this.service = null
    this.txCharacteristic = null
    this.rxCharacteristic = null
  }

  private handleData = (event: Event): void => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value
    if (!value) return

    const decoder = new TextDecoder()
    const data = decoder.decode(value)
    this._onData.dispatch(data)
  }

  public get onData () {
    return this._onData.asEvent()
  }

  async sendData (data: string): Promise<void> {
    if (!this.txCharacteristic || !this.rxCharacteristic) {
      throw new FrameNotConnectedError()
    }

    const encoder = new TextEncoder()
    const command = encoder.encode(data)
    await this.txCharacteristic.writeValue(command)
  }
}
