import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { useForumCategories, useCreateForumPost } from '@/lib/forumQueries'
import { cn } from '@/lib/utils'

const POST_TYPES = [
  { value: 'DISCUSSION', label: 'Discussion' },
  { value: 'QUESTION', label: 'Question' },
  { value: 'EXPERIENCE', label: 'Experience' },
  { value: 'RESOURCE', label: 'Resource' },
  { value: 'CLINICAL_CASE', label: 'Clinical Case' },
  { value: 'HOSPITAL_REVIEW', label: 'Hospital Review' },
]

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_PDF_SIZE = 10 * 1024 * 1024

export function ForumNewPostPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const categories = useForumCategories()
  const createPost = useCreateForumPost()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [postType, setPostType] = useState('DISCUSSION')
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (title.trim().length < 10) errs.title = 'Title must be at least 10 characters'
    if (title.trim().length > 200) errs.title = 'Title must be 200 characters or fewer'
    if (content.trim().length < 10) errs.content = 'Content must be at least 10 characters'
    if (content.trim().length > 20000) errs.content = 'Content must be 20,000 characters or fewer'
    if (!categoryId) errs.categoryId = 'Please select a category'
    if (files.length > 5) errs.files = 'Maximum 5 attachments allowed'
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errs.files = 'Only JPEG, PNG, WebP, and PDF files are allowed'
        break
      }
      if (file.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
        errs.files = `Image "${file.name}" exceeds 5MB limit`
        break
      }
      if (file.type === 'application/pdf' && file.size > MAX_PDF_SIZE) {
        errs.files = `PDF "${file.name}" exceeds 10MB limit`
        break
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    createPost.mutate(
      {
        data: {
          title: title.trim(),
          content: content.trim(),
          categoryId,
          postType,
        },
        files,
      },
      {
        onSuccess: (result) => {
          toast.success('Post created', 'Your discussion has been published.')
          navigate(`/forum/post/${result.id}`)
        },
        onError: (err: any) => {
          if (err?.code === 'CONTENT_MODERATION_BLOCKED' || err?.message?.includes('community guidelines')) {
            toast.error(
              'Community Guidelines Violation',
              'Your post could not be published because it contains language that violates our community guidelines.',
            )
          } else if (err?.code === 'FORUM_TEMP_BANNED') {
            toast.error(
              'Forum Access Suspended',
              'Your forum access is temporarily suspended. Please visit the Forum home page to submit an appeal.',
            )
          } else {
            toast.error('Failed to create post', err.message || 'An error occurred while creating your post.')
          }
        },
      },
    )
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...newFiles].slice(0, 5))
    e.target.value = ''
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100"
        >
          <ArrowLeft className="size-5" />
        </button>
        <PageHeader title="Create Post" subtitle="Share a question, experience, or resource with the community." />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Title</label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter a descriptive title..."
            maxLength={200}
          />
          <div className="mt-1 flex justify-between">
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
            <span className="ml-auto text-xs text-ink-400">{title.length}/200</span>
          </div>
        </div>

        {/* Category + Post Type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className={cn(
                'h-10 w-full cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
              )}
            >
              <option value="">Select a category...</option>
              {(categories.data ?? []).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Post Type</label>
            <select
              value={postType}
              onChange={e => setPostType(e.target.value)}
              className={cn(
                'h-10 w-full cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
              )}
            >
              {POST_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Content</label>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your post content here..."
            rows={12}
            className="resize-y"
          />
          <div className="mt-1 flex justify-between">
            {errors.content && <p className="text-xs text-red-600">{errors.content}</p>}
            <span className="ml-auto text-xs text-ink-400">{content.length.toLocaleString()}/20,000</span>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">
            Attachments <span className="font-normal text-ink-500">(optional, max 5)</span>
          </label>
          <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50/50 p-4">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50">
              <Upload className="size-4" />
              Choose files (Images: 5MB, PDF: 10MB)
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2">
                    <span className="truncate text-sm text-ink-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="ml-2 grid size-6 cursor-pointer place-items-center rounded text-ink-400 hover:text-red-600"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.files && <p className="mt-1 text-xs text-red-600">{errors.files}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-ink-200 pt-5">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createPost.isPending}>
            {createPost.isPending ? 'Publishing...' : 'Publish Post'}
          </Button>
        </div>
      </form>
    </div>
  )
}
