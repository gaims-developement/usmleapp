import { useEffect, useState } from 'react'
import {
  Check,
  CheckCircle2,
  CreditCard,
  Landmark,
  Lock,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/mocks/applications'

const GATEWAYS: Record<PaymentMethod, { label: string; icon: LucideIcon; tint: string }> = {
  razorpay: { label: 'Razorpay', icon: Zap, tint: 'bg-sky-900' },
  stripe: { label: 'Stripe', icon: Sparkles, tint: 'bg-indigo-600' },
  card: { label: 'Debit / Credit card', icon: CreditCard, tint: 'bg-ink-900' },
  bank_transfer: { label: 'Bank transfer', icon: Landmark, tint: 'bg-emerald-600' },
  upi: { label: 'UPI', icon: Smartphone, tint: 'bg-violet-600' },
  paypal: { label: 'PayPal', icon: Wallet, tint: 'bg-sky-700' },
}

type Phase = 'form' | 'processing' | 'success'

export function GatewayCheckout({
  gateway,
  amount,
  hospital,
  onComplete,
  onClose,
}: {
  gateway: PaymentMethod
  amount: number
  hospital: string
  onComplete: () => void
  onClose: () => void
}) {
  const [phase, setPhase] = useState<Phase>('form')
  const [ready, setReady] = useState(true)
  const meta = GATEWAYS[gateway]
  const Icon = meta.icon
  const formatted = `$${amount.toLocaleString()}`

  function startPayment() {
    if (!ready) return
    setPhase('processing')
    setTimeout(() => {
      setPhase('success')
      onComplete()
    }, 1600)
  }

  const payLabel =
    gateway === 'bank_transfer'
      ? 'Confirm transfer'
      : gateway === 'upi'
        ? 'Verify & pay'
        : gateway === 'paypal'
          ? 'Pay with PayPal'
          : gateway === 'razorpay'
            ? 'Pay securely'
            : `Pay ${formatted}`

  return (
    <Modal
      open
      onClose={phase === 'processing' ? () => {} : onClose}
      title={
        phase === 'success'
          ? 'Payment complete'
          : phase === 'processing'
            ? 'Processing payment'
            : `Pay with ${meta.label}`
      }
      description={phase === 'success' ? undefined : `${hospital} · ${formatted}`}
      size="sm"
      footer={
        phase === 'success' ? (
          <Button variant="primary" size="sm" className="w-full" onClick={onClose}>
            <Check className="size-4" aria-hidden />
            Done
          </Button>
        ) : phase === 'processing' ? (
          <Button variant="primary" size="sm" className="w-full" disabled>
            <Spinner className="size-4" />
            Processing…
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={startPayment} disabled={!ready}>
              {payLabel}
            </Button>
          </>
        )
      }
    >
      {phase === 'success' ? (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-brand-50">
            <CheckCircle2 className="size-8 text-brand-600" aria-hidden />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink-900">Payment successful</h3>
          <p className="mt-1 text-sm text-ink-600">
            {formatted} received via {meta.label}. You can now continue with your application.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 rounded-2xl border border-ink-200 p-4">
            <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl text-white', meta.tint)}>
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink-900">{meta.label}</p>
              <p className="text-xs text-ink-500">{formatted}</p>
            </div>
          </div>

          <div className="mt-5">
            <GatewayBody gateway={gateway} onReadyChange={setReady} />
          </div>

          <p className="mt-5 flex items-center gap-1.5 text-xs text-ink-500">
            <Lock className="size-3.5 text-brand-600" aria-hidden />
            Encrypted and processed securely by {meta.label}.
          </p>
        </div>
      )}
    </Modal>
  )
}

function GatewayBody({
  gateway,
  onReadyChange,
}: {
  gateway: PaymentMethod
  onReadyChange: (ready: boolean) => void
}) {
  switch (gateway) {
    case 'razorpay':
      return <RazorpayForm onReadyChange={onReadyChange} />
    case 'stripe':
      return <CardForm onReadyChange={onReadyChange} />
    case 'card':
      return <CardForm onReadyChange={onReadyChange} />
    case 'bank_transfer':
      return <BankTransferForm onReadyChange={onReadyChange} />
    case 'upi':
      return <UpiForm onReadyChange={onReadyChange} />
    case 'paypal':
      return <PayPalBody />
  }
}

function CardForm({ onReadyChange }: { onReadyChange: (ready: boolean) => void }) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  const valid =
    name.trim().length > 0 &&
    number.replace(/\D/g, '').length >= 12 &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    cvc.replace(/\D/g, '').length >= 3

  useEffect(() => {
    onReadyChange(valid)
    return () => onReadyChange(false)
  }, [valid, onReadyChange])

  return (
    <div className="space-y-4">
      <Field label="Cardholder name">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
      </Field>
      <Field label="Card number">
        <Input
          value={number}
          onChange={e => setNumber(e.target.value)}
          placeholder="4242 4242 4242 4242"
          inputMode="numeric"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Expiry">
          <Input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" />
        </Field>
        <Field label="CVC">
          <Input value={cvc} onChange={e => setCvc(e.target.value)} placeholder="123" inputMode="numeric" />
        </Field>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-ink-500">
        <ShieldCheck className="size-3.5 text-brand-600" aria-hidden />
        Your card details are never stored.
      </p>
    </div>
  )
}

function RazorpayForm({ onReadyChange }: { onReadyChange: (ready: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const valid = email.includes('@') && phone.replace(/\D/g, '').length >= 10

  useEffect(() => {
    onReadyChange(valid)
    return () => onReadyChange(false)
  }, [valid, onReadyChange])

  return (
    <div className="space-y-4">
      <Field label="Email">
        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
      </Field>
      <Field label="Phone">
        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 123 4567" inputMode="tel" />
      </Field>
      <p className="flex items-center gap-1.5 text-xs text-ink-500">
        <Zap className="size-3.5 text-amber-500" aria-hidden />
        You&apos;ll get a payment link on Razorpay to complete checkout.
      </p>
    </div>
  )
}

function UpiForm({ onReadyChange }: { onReadyChange: (ready: boolean) => void }) {
  const [vpa, setVpa] = useState('')

  const valid = /^[\w.-]+@[a-z]{2,}$/i.test(vpa.trim())

  useEffect(() => {
    onReadyChange(valid)
    return () => onReadyChange(false)
  }, [valid, onReadyChange])

  return (
    <div className="space-y-4">
      <Field label="UPI ID">
        <Input value={vpa} onChange={e => setVpa(e.target.value)} placeholder="yourname@okhdfcbank" />
      </Field>
      <div className="flex flex-wrap gap-2">
        {['GPay', 'PhonePe', 'Paytm'].map(app => (
          <button
            key={app}
            type="button"
            onClick={() => setVpa(`${app.toLowerCase()}@upi`)}
            className="rounded-full border border-ink-300 bg-white px-4 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-700"
          >
            {app}
          </button>
        ))}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-ink-500">
        <Smartphone className="size-3.5 text-violet-500" aria-hidden />
        Approve the payment request in your UPI app.
      </p>
    </div>
  )
}

function BankTransferForm({ onReadyChange }: { onReadyChange: (ready: boolean) => void }) {
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    onReadyChange(confirmed)
    return () => onReadyChange(false)
  }, [confirmed, onReadyChange])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4 text-sm">
        <Row label="Bank" value="JPMorgan Chase" />
        <Row label="Account" value="XXXX 1234 5678" />
        <Row label="Routing" value="021000021" />
        <Row label="Reference" value="ROT-2468" />
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 p-4 transition-colors hover:border-brand-300">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={e => setConfirmed(e.target.checked)}
          className="mt-0.5 size-4.5 shrink-0 accent-brand-600"
        />
        <span className="text-sm text-ink-700">
          I have transferred the amount using the reference above.
        </span>
      </label>
    </div>
  )
}

function PayPalBody() {
  return (
    <div className="space-y-4 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-sky-100 text-sky-700">
        <Wallet className="size-6" aria-hidden />
      </span>
      <p className="text-sm text-ink-600">
        You&apos;ll be securely redirected to PayPal to complete your payment. Click below to continue.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</span>
      {children}
    </label>
  )
}
