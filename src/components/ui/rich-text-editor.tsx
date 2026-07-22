import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

  return (
    <div className="rounded border border-outline-variant bg-surface-container-lowest focus-within:border-primary">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-outline-variant/40 p-1">
        <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
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
        <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
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
