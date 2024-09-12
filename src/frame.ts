import debug from 'debug'
import { SimpleEventDispatcher } from 'strongly-typed-events'
import { Display } from './display'
import type { Transport } from './transport/schema'
import { WebBluetoothTransport } from './transport/web-bluetooth'

const log = debug('frame-sdk')

interface FrameOptions {
  transport?: Transport;
}

export class Frame implements Transport {
  private _onData = new SimpleEventDispatcher<string>()
  private transport: Transport

  constructor (public options: FrameOptions = {}) {
    this.transport = options.transport ?? new WebBluetoothTransport()
    this.transport.onData.subscribe((data) => this._onData.dispatch(data))
  }

  async connect (): Promise<void> {
    await this.transport.connect()
    log('Connected to Frame')
  }

  async disconnect (): Promise<void> {
    await this.transport.disconnect()
    log('Disconnected from Frame')
  }

  public get onData () {
    return this._onData.asEvent()
  }

  async sendData (data: string): Promise<void> {
    await this.transport.sendData(data)
  }

  get display (): Display {
    return new Display(this.transport)
  }
}
