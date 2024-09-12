import noble from '@abandonware/noble'
import debug from 'debug'
import { SimpleEventDispatcher } from 'strongly-typed-events'
import { FrameConnectionError, FrameNotConnectedError } from '../errors'
import {
  RX_CHARACTERISTIC_UUID,
  SERVICE_UUID,
  TX_CHARACTERISTIC_UUID
} from './constants'
import type { Transport } from './schema'

const log = debug('frame-sdk:noble')

export class NobleTransport implements Transport {
  private _onData = new SimpleEventDispatcher<string>()
  private peripheral: noble.Peripheral | null = null
  private txCharacteristic: noble.Characteristic | null = null
  private rxCharacteristic: noble.Characteristic | null = null

  constructor () {
    noble.on('stateChange', this.handleStateChange)
  }

  private handleStateChange = (state: string) => {
    log('Bluetooth adapter state:', state)
    if (state === 'poweredOn') {
      log('Bluetooth adapter is ready')
      noble.startScanning([SERVICE_UUID], false)
    } else {
      log('Bluetooth adapter is not ready')
    }
  }

  async connect (): Promise<void> {
    return new Promise((resolve, reject) => {
      noble.on('discover', async (peripheral) => {
        if (peripheral.advertisement.localName?.startsWith('Frame')) {
          log('Found Frame device:', peripheral.address)
          noble.stopScanning()

          try {
            await this.connectToPeripheral(peripheral)
            resolve()
          } catch (error) {
            reject(error)
          }
        }
      })

      setTimeout(() => {
        noble.stopScanning()
        reject(new FrameConnectionError('Frame device not found'))
      }, 10000) // 10 second timeout
    })
  }

  private async connectToPeripheral (
    peripheral: noble.Peripheral
  ): Promise<void> {
    this.peripheral = peripheral

    log('Connecting to Frame...')
    await peripheral.connectAsync()

    log('Discovering services and characteristics...')
    const { characteristics } =
      await peripheral.discoverSomeServicesAndCharacteristicsAsync(
        [SERVICE_UUID],
        [TX_CHARACTERISTIC_UUID, RX_CHARACTERISTIC_UUID]
      )

    this.txCharacteristic =
      characteristics.find(
        (c) =>
          c.uuid ===
          TX_CHARACTERISTIC_UUID.replaceAll('-', '').toLocaleLowerCase()
      ) || null
    this.rxCharacteristic =
      characteristics.find(
        (c) =>
          c.uuid ===
          RX_CHARACTERISTIC_UUID.replaceAll('-', '').toLocaleLowerCase()
      ) || null

    if (!this.txCharacteristic || !this.rxCharacteristic) {
      throw new FrameConnectionError('Required characteristics not found')
    }

    log('Subscribing to notifications...')
    await this.rxCharacteristic.subscribeAsync()
    this.rxCharacteristic.on('data', this.handleData)

    log('Connected to Frame')
  }

  async disconnect (): Promise<void> {
    if (this.rxCharacteristic) {
      this.rxCharacteristic.removeListener('data', this.handleData)
      await this.rxCharacteristic.unsubscribeAsync()
    }

    if (this.peripheral) {
      await this.peripheral.disconnectAsync()
    }

    this.peripheral = null
    this.txCharacteristic = null
    this.rxCharacteristic = null
  }

  private handleData = (data: Buffer): void => {
    const decodedData = data.toString('utf-8')
    this._onData.dispatch(decodedData)
  }

  public get onData () {
    return this._onData.asEvent()
  }

  async sendData (data: string): Promise<void> {
    if (!this.txCharacteristic) {
      throw new FrameNotConnectedError()
    }

    const buffer = Buffer.from(data, 'utf-8')
    await this.txCharacteristic.writeAsync(buffer, false)
  }
}
