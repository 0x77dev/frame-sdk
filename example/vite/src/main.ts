import { Frame } from '@0x77/frame-sdk'
declare global {
  interface Window {
    Frame: typeof Frame;
  }
}

window.Frame = Frame
