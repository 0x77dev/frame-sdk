export class FrameError extends Error {}

export class FrameConnectionError extends FrameError {}

export class FrameNotConnectedError extends FrameConnectionError {}
