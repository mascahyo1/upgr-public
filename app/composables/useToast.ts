export interface ToastItem {
  id: number
  msg: string
  type: 'ok' | 'error'
}

let seq = 1

export function useToast() {
  const toasts = useState<ToastItem[]>('toasts', () => [])
  function push(msg: string, type: 'ok' | 'error' = 'ok') {
    const id = seq++
    toasts.value.push({ id, msg, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 4000)
  }
  return { toasts, toast: push }
}
