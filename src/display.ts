import { z } from 'zod'
import type { Transport } from './transport/schema'

const COLORS = <const>[
  'VOID',
  'WHITE',
  'GREY',
  'RED',
  'PINK',
  'DARKBROWN',
  'BROWN',
  'ORANGE',
  'YELLOW',
  'DARKGREEN',
  'GREEN',
  'LIGHTGREEN',
  'NIGHTBLUE',
  'SEABLUE',
  'SKYBLUE'
]

export const DisplayColorsSchema = z.enum(COLORS)
export type DisplayColor = z.infer<typeof DisplayColorsSchema>;

const DisplayTextSchema = z.object({
  text: z.string(),
  x: z.number().min(1).max(640).default(1),
  y: z.number().min(1).max(400).default(1),
  color: DisplayColorsSchema.default('WHITE'),
  spacing: z.number().min(0).default(4)
})
export type DisplayText = z.infer<typeof DisplayTextSchema>;

export class Display {
  // eslint-disable-next-line no-useless-constructor
  constructor (private transport: Transport) {}

  async text (options: DisplayText): Promise<void> {
    const { text, x, y, color, spacing } = DisplayTextSchema.parse(options)
    await this.transport.sendData(
      `frame.display.text('${text}', ${x}, ${y}, {color = '${color}', spacing = ${spacing}})`
    )
  }

  async show (): Promise<void> {
    await this.transport.sendData('frame.display.show()')
  }
}
