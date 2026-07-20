import * as React from 'react'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 4000

export type ToasterToast = {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error'
}

type ToastInput = Omit<ToasterToast, 'id'>

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Listener = (toasts: ToasterToast[]) => void
let memoryState: ToasterToast[] = []
const listeners: Listener[] = []

function emit() {
  listeners.forEach((listener) => listener(memoryState))
}

function dismiss(id: string) {
  memoryState = memoryState.filter((t) => t.id !== id)
  emit()
}

function toast(input: ToastInput) {
  const id = genId()
  memoryState = [{ id, ...input }, ...memoryState].slice(0, TOAST_LIMIT)
  emit()
  window.setTimeout(() => dismiss(id), TOAST_REMOVE_DELAY)
  return id
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>(memoryState)

  React.useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return { toasts, toast, dismiss }
}
