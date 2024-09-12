import { type ISimpleEvent } from 'strongly-typed-events'

export interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendData(data: string): Promise<void>;
  onData: ISimpleEvent<string>;
}
