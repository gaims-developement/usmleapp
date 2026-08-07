import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  FileText,
  LayoutTemplate,
  MessageSquare,
  Paperclip,
  Send,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { Avatar } from '@/components/ui/avatar'
import { Popover } from '@/components/ui/popover'
import { useToast } from '@/components/ui/toast'
import {
  useDoctorConversations,
  useDoctorMessageTemplates,
  useMarkDoctorConversationRead,
  useSendDoctorMessage,
} from '@/lib/doctorQueries'
import { cn } from '@/lib/utils'
import type { DoctorConversation } from '@/mocks/doctor/messages'

const ATTACHMENT = { name: 'assessment-summary.pdf', size: '2.1 MB' }

const roleLabel: Record<DoctorConversation['counterpartRole'], string> = {
  student: 'Student',
  coordinator: 'Program Coordinator',
  admin: 'Operations',
}

export function DoctorMessagesPage() {
  const conversations = useDoctorConversations()
  const templates = useDoctorMessageTemplates()
  const send = useSendDoctorMessage()
  const markRead = useMarkDoctorConversationRead()
  const toast = useToast()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [attach, setAttach] = useState(false)

  const selected = useMemo<DoctorConversation | undefined>(() => {
    const list = conversations.data ?? []
    return list.find(c => c.id === selectedId) ?? list[0]
  }, [conversations.data, selectedId])

  useEffect(() => {
    if (selected && selected.unread > 0) markRead.mutate(selected.id)
  }, [selected?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (conversations.isLoading) return <PageLoader label="Loading messages…" />

  const list = conversations.data ?? []
  const active = selected ?? list[0]

  function insertTemplate(body: string) {
    const firstName = active.counterpartName.split(' ')[0]
    setDraft(body.replaceAll('{name}', firstName))
  }

  function handleSend() {
    if (!active || !draft.trim()) return
    send.mutate(
      { conversationId: active.id, text: draft.trim(), attachment: attach ? ATTACHMENT : undefined },
      {
        onSuccess: () => {
          setDraft('')
          setAttach(false)
        },
        onError: () => toast.error('Could not send message'),
      },
    )
  }

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Communicate with students, coordinators, and hospital administration."
        actions={
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500">
            <MessageSquare className="size-4" aria-hidden />
            {list.reduce((sum, c) => sum + c.unread, 0)} unread
          </span>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-3xl border border-ink-200 bg-white p-3 shadow-soft">
          <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-ink-400">Conversations</p>
          <div className="max-h-[calc(100vh-320px)] space-y-1 overflow-y-auto lg:max-h-[560px]">
            {list.map(c => {
              const isActive = c.id === active?.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-colors',
                    isActive ? 'border-brand-300 bg-brand-50/60' : 'border-transparent hover:bg-ink-50',
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar name={c.counterpartName} />
                    {c.unread > 0 && (
                      <span className="absolute -right-1 -top-1 grid size-4.5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn('truncate text-sm', c.unread > 0 ? 'font-bold text-ink-900' : 'font-semibold text-ink-800')}>
                        {c.counterpartName}
                      </p>
                      <span className="shrink-0 text-[11px] text-ink-400">{c.lastTime}</span>
                    </div>
                    <p className="truncate text-xs text-ink-500">{c.lastMessage}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-brand-700">{roleLabel[c.counterpartRole]}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="flex min-h-[560px] flex-col rounded-3xl border border-ink-200 bg-white shadow-soft">
          {active ? (
            <>
              <header className="flex items-center justify-between gap-3 border-b border-ink-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={active.counterpartName} />
                  <div>
                    <p className="font-display text-sm font-bold text-ink-900">{active.counterpartName}</p>
                    <p className="text-xs text-ink-500">{roleLabel[active.counterpartRole]}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  <ArrowUpRight className="size-3.5" aria-hidden />
                  {active.counterpartRole === 'student' ? 'Supervised student' : 'Active thread'}
                </span>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {active.messages.map(m => {
                  const mine = m.from === 'doctor'
                  return (
                    <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-3',
                          mine ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-ink-100 text-ink-800',
                        )}
                      >
                        <p className="text-sm leading-relaxed">{m.text}</p>
                        {m.attachment && (
                          <div
                            className={cn(
                              'mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold',
                              mine ? 'bg-brand-700 text-white' : 'bg-white text-ink-700',
                            )}
                          >
                            <FileText className="size-4" aria-hidden />
                            <span className="truncate">{m.attachment.name}</span>
                            <span className={cn('shrink-0', mine ? 'text-brand-100' : 'text-ink-400')}>{m.attachment.size}</span>
                          </div>
                        )}
                        <p className={cn('mt-1.5 text-right text-[11px]', mine ? 'text-brand-100' : 'text-ink-400')}>{m.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <footer className="border-t border-ink-100 px-6 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Popover
                    align="left"
                    panelClassName="w-80"
                    trigger={
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3.5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50">
                        <LayoutTemplate className="size-4" aria-hidden />
                        Templates
                      </span>
                    }
                  >
                    <div className="max-h-80 overflow-y-auto p-2">
                      <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-ink-400">
                        Quick responses
                      </p>
                      {(templates.data ?? []).map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => insertTemplate(t.text)}
                          className="block w-full cursor-pointer rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink-50"
                        >
                          <span className="block text-sm font-semibold text-ink-900">{t.label}</span>
                          <span className="block truncate text-xs text-ink-500">{t.text}</span>
                        </button>
                      ))}
                    </div>
                  </Popover>
                  <button
                    type="button"
                    onClick={() => setAttach(a => !a)}
                    aria-pressed={attach}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-sm font-semibold transition-colors',
                      attach
                        ? 'border-brand-400 bg-brand-50 text-brand-700'
                        : 'border-ink-200 text-ink-700 hover:bg-ink-50',
                    )}
                  >
                    <Paperclip className="size-4" aria-hidden />
                    Attach
                  </button>
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    rows={2}
                    placeholder={`Message ${active.counterpartName.split(' ')[0]}…`}
                    className="min-w-0 flex-1 rounded-xl border border-ink-300 bg-white px-4 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!draft.trim() || send.isPending}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="size-4" aria-hidden />
                    Send
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="grid size-14 place-items-center rounded-3xl bg-ink-100 text-ink-400">
                <MessageSquare className="size-7" aria-hidden />
              </div>
              <p className="font-display text-sm font-bold text-ink-800">No conversations yet</p>
              <p className="max-w-sm text-sm text-ink-500">
                Messages you exchange with students and hospital staff will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
