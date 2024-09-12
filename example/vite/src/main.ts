import { Frame } from 'frame-sdk'
declare global {
  interface Window {
    Frame: typeof Frame;
  }
}

window.Frame = Frame
