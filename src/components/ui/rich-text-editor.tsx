import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  ImagePlus,
  Undo2,
  Redo2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { readImageAsDataUrl } from '@/lib/readImageAsDataUrl'

const MAX_INLINE_IMAGE_BYTES = 1 * 1024 * 1024

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded transition-colors disabled:pointer-events-none disabled:opacity-40',
        active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
      )}
    >
      {children}
    </button>
  )
}

/** HTML rich text editor for admin content fields (currently the blog post body). Wraps Tiptap with
 * a Tailwind toolbar matching the rest of the design system, instead of a default styled widget. */
function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set right before calling onChange from this editor's own onUpdate, so the sync effect below
  // can tell "the parent's value prop changed because we just typed" apart from "the parent swapped
  // in different content entirely" (e.g. switching posts) — otherwise the effect re-applies a
  // one-render-stale value on top of whatever was typed since, silently eating keystrokes/blocks.
  const isInternalUpdate = useRef(false)

  const editor = useEditor({
    // Avoids a null-ref crash from Tiptap initializing twice under React StrictMode's
    // mount/unmount/remount dev cycle — deferring the first render sidesteps it.
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? 'Write your post…' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'min-h-40 max-w-none px-3 py-2 text-body-md text-on-surface focus:outline-none ' +
          '[&_h2]:font-display [&_h2]:text-headline-md [&_h2]:text-on-surface [&_h2]:mt-4 [&_h2]:mb-2 ' +
          '[&_h3]:font-display [&_h3]:text-body-lg [&_h3]:font-bold [&_h3]:text-on-surface [&_h3]:mt-3 [&_h3]:mb-1.5 ' +
          '[&_p]:mb-3 [&_p:last-child]:mb-0 ' +
          '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 ' +
          '[&_blockquote]:border-l-4 [&_blockquote]:border-outline-variant [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-on-surface-variant ' +
          '[&_hr]:my-4 [&_hr]:border-outline-variant ' +
          '[&_code]:rounded [&_code]:bg-surface-container-low [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-label-md ' +
          '[&_img]:my-2 [&_img]:max-w-full [&_img]:rounded ' +
          '[&_a]:text-primary [&_a]:underline [&_strong]:font-bold',
      },
    },
  })

  // Keep the editor in sync when a different post loads (e.g. navigating from "New Post" straight
  // to editing an existing one without an unmount in between) — but never for a `value` change that
  // originated from this same editor, since that snapshot can already be stale by the time this runs.
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', previousUrl ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_INLINE_IMAGE_BYTES) {
      toast({ title: 'Image too large', description: 'Please choose a file under 1MB.', variant: 'error' })
      return
    }
    const dataUrl = await readImageAsDataUrl(file)
    editor.chain().focus().setImage({ src: dataUrl }).run()
  }

  return (
    <div className="rounded border border-outline-variant bg-surface-container-lowest focus-within:border-primary">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-outline-variant/40 p-1">
        <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-outline-variant/40" />
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-outline-variant/40" />
        <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Insert image" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            void handleImageFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <div className="mx-1 h-5 w-px bg-outline-variant/40" />
        <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export { RichTextEditor }
