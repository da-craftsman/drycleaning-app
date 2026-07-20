import { delay } from '@/lib/data/mock/store'

/** Mock upload: reads the file as a data URL so it can round-trip through localStorage-backed mock records. */
export function uploadFileMock(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => delay(reader.result as string, 400).then(resolve)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
