import { formatDate, paymentMethodLabels } from '@/lib/utils'
import type { Payment } from '@/lib/types'

export const RECEIPT_WIDTH = 1200
export const RECEIPT_HEIGHT = 1600

const CARD_X = 76
const CARD_WIDTH = 1048
const CARD_TOP = 72
const PAD_X = 132
const RIGHT_X = 1068
const CONTENT_WIDTH = 936
const CENTER_X = 600
const FONT_BASE = 'Inter, Arial, sans-serif'

const COLORS = {
  page: '#f8fafc',
  card: '#ffffff',
  border: '#dbe3ee',
  brandDark: '#0f766e',
  ink: '#0f172a',
  inkSoft: '#334155',
  muted: '#64748b',
  line: '#e2e8f0',
  successBg: '#ecfdf5',
  successBorder: '#99f6e4',
  successText: '#047857',
  recordBg: '#f1f5f9',
  recordBorder: '#cbd5e1',
  recordText: '#475569',
}

function font(weight: number, size: number): string {
  return `${weight} ${size}px ${FONT_BASE}`
}

function methodLabel(method: string): string {
  const label = paymentMethodLabels[method as keyof typeof paymentMethodLabels]
  return label ?? method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function currency(value: number, code: string): string {
  const fractionDigits = Number.isInteger(value) ? 0 : 2
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code || 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

function drawLine(ctx: CanvasRenderingContext2D, y: number): void {
  ctx.strokeStyle = COLORS.line
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(PAD_X, y)
  ctx.lineTo(RIGHT_X, y)
  ctx.stroke()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = testLine
    }
  }

  if (line) ctx.fillText(line, x, currentY)
  return currentY
}

function row(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
): number {
  ctx.font = font(700, 24)
  ctx.fillStyle = COLORS.muted
  ctx.fillText(label.toUpperCase(), x, y)
  ctx.font = font(500, 30)
  ctx.fillStyle = COLORS.ink
  const bottom = wrapText(ctx, value || '—', x, y + 36, maxWidth, 34)
  return bottom + 20
}

export function drawReceipt(ctx: CanvasRenderingContext2D, payment: Payment): number {
  const isPaid = payment.status.toLowerCase() === 'paid'
  const cardBottom = ctx.canvas.height - 72

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = COLORS.page
  ctx.fillRect(0, 0, RECEIPT_WIDTH, ctx.canvas.height)
  ctx.fillStyle = COLORS.card
  ctx.fillRect(CARD_X, CARD_TOP, CARD_WIDTH, cardBottom - CARD_TOP)
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 3
  ctx.strokeRect(CARD_X, CARD_TOP, CARD_WIDTH, cardBottom - CARD_TOP)

  ctx.fillStyle = COLORS.brandDark
  ctx.fillRect(CARD_X, CARD_TOP, CARD_WIDTH, 18)

  ctx.textAlign = 'center'
  ctx.font = font(800, 58)
  ctx.fillStyle = COLORS.ink
  ctx.fillText('IMG Prep', CENTER_X, 168)
  ctx.font = font(500, 30)
  ctx.fillStyle = COLORS.muted
  ctx.fillText('Residency Hub', CENTER_X, 214)
  ctx.font = font(800, 46)
  ctx.fillStyle = COLORS.ink
  ctx.fillText('PAYMENT RECEIPT', CENTER_X, 316)

  ctx.textAlign = 'left'
  ctx.font = font(600, 30)
  ctx.fillStyle = COLORS.inkSoft
  ctx.fillText(`Receipt No: ${payment.receiptNumber}`, PAD_X, 398)
  ctx.fillText(`Payment Date: ${formatDate(payment.paidAt || payment.submittedAt)}`, PAD_X, 446)

  let y = 512
  drawLine(ctx, y)
  y += 66

  y = row(ctx, 'Student', `${payment.studentName}  |  ${payment.studentEmail}`, PAD_X, y, CONTENT_WIDTH)
  y += 32
  drawLine(ctx, y)
  y += 66

  y = row(ctx, 'Application ID', payment.applicationId, PAD_X, y, CONTENT_WIDTH)
  y = row(ctx, 'Program', payment.specialty, PAD_X, y, CONTENT_WIDTH)
  y = row(ctx, 'Hospital', payment.hospital, PAD_X, y, CONTENT_WIDTH)
  y += 32
  drawLine(ctx, y)
  y += 66

  ctx.font = font(700, 24)
  ctx.fillStyle = COLORS.muted
  ctx.fillText('PAYMENT DETAILS', PAD_X, y)

  ctx.textAlign = 'right'
  ctx.font = font(700, 26)
  ctx.fillStyle = COLORS.muted
  ctx.fillText('Amount', RIGHT_X, y)
  ctx.font = font(800, 54)
  ctx.fillStyle = COLORS.brandDark
  ctx.fillText(`${currency(payment.amount, payment.currency)} ${payment.currency || 'USD'}`, RIGHT_X, y + 72)
  ctx.textAlign = 'left'

  y += 56
  y = row(ctx, 'Transaction ID / UTR', payment.transactionId || '—', PAD_X, y, CONTENT_WIDTH)
  y = row(ctx, 'Payment Method', methodLabel(payment.paymentMethod), PAD_X, y, CONTENT_WIDTH)
  y = row(ctx, 'Status', payment.status.replace(/_/g, ' ').toUpperCase(), PAD_X, y, CONTENT_WIDTH)

  const bannerTop = y + 26
  const bannerHeight = 90
  ctx.fillStyle = isPaid ? COLORS.successBg : COLORS.recordBg
  ctx.fillRect(PAD_X, bannerTop, CONTENT_WIDTH, bannerHeight)
  ctx.strokeStyle = isPaid ? COLORS.successBorder : COLORS.recordBorder
  ctx.lineWidth = 2
  ctx.strokeRect(PAD_X, bannerTop, CONTENT_WIDTH, bannerHeight)
  ctx.textAlign = 'center'
  ctx.font = font(800, 32)
  ctx.fillStyle = isPaid ? COLORS.successText : COLORS.recordText
  ctx.fillText(isPaid ? 'PAYMENT SUCCESSFUL' : 'PAYMENT RECORD', CENTER_X, bannerTop + 58)
  ctx.textAlign = 'left'

  ctx.textAlign = 'center'
  ctx.font = font(500, 26)
  ctx.fillStyle = COLORS.muted
  ctx.fillText('This is a computer-generated receipt.', CENTER_X, cardBottom - 60)
  ctx.font = font(800, 28)
  ctx.fillStyle = COLORS.ink
  ctx.fillText('IMG Prep', CENTER_X, cardBottom - 12)
  ctx.textAlign = 'left'

  return Math.max(bannerTop + bannerHeight + 8, cardBottom - 12)
}

export function receiptFilename(payment: Payment): string {
  const appPart = payment.applicationId.replace(/[^a-z0-9-]/gi, '').slice(-12).toUpperCase()
  return `IMG-Prep-Receipt-${appPart || payment.id.slice(-8).toUpperCase()}.png`
}

const RECEIPT_FONTS = [
  '600 30px Inter',
  '500 30px Inter',
  '700 24px Inter',
  '500 32px Inter',
  '800 46px Inter',
  '800 58px Inter',
  '800 54px Inter',
  '800 32px Inter',
]

async function ensureFonts(): Promise<void> {
  try {
    if (!('fonts' in document)) return
    const settle = async () => {
      await Promise.all(RECEIPT_FONTS.map(face => document.fonts.load(face)))
      await document.fonts.ready
    }
    await Promise.race([
      settle(),
      new Promise<void>(resolve => setTimeout(resolve, 2000)),
    ])
  } catch {
    // Fonts are optional; the canvas falls back to Arial if unavailable.
  }
}

export async function createReceiptCanvas(payment: Payment): Promise<HTMLCanvasElement> {
  await ensureFonts()

  let height = RECEIPT_HEIGHT
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const canvas = document.createElement('canvas')
    canvas.width = RECEIPT_WIDTH
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available in this browser.')
    const used = drawReceipt(ctx, payment)
    if (used <= height - 24) return canvas
    height = used + 96
  }

  const canvas = document.createElement('canvas')
  canvas.width = RECEIPT_WIDTH
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')
  drawReceipt(ctx, payment)
  return canvas
}

export async function receiptBlob(payment: Payment): Promise<Blob> {
  const canvas = await createReceiptCanvas(payment)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Receipt image could not be generated.'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

export async function downloadReceipt(payment: Payment): Promise<void> {
  const blob = await receiptBlob(payment)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = receiptFilename(payment)
  a.click()
  URL.revokeObjectURL(url)
}
