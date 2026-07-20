import { useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function PhotoUpload({
  images,
  onAdd,
  onRemove,
  label = 'Upload photos of stained or damaged items',
}: {
  images: string[]
  onAdd: (dataUrl: string) => void
  onRemove: (dataUrl: string) => void
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => onAdd(reader.result as string)
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="flex flex-col gap-stack-sm">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low px-stack-md py-stack-lg text-center transition-colors hover:border-primary hover:bg-primary/5"
      >
        <Camera className="h-6 w-6 text-on-surface-variant" strokeWidth={1.5} />
        <p className="text-label-md text-on-surface-variant">{label}</p>
        <p className="text-label-sm text-on-surface-variant">Tap to browse or drag photos here</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((src) => (
            <div key={src} className={cn('relative aspect-square overflow-hidden rounded border border-outline-variant/40')}>
              <img src={src} alt="Uploaded stain" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(src)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-inverse-surface/80 text-inverse-on-surface"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { PhotoUpload }
