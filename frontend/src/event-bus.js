import mitt from 'mitt'
import { onBeforeUnmount } from 'vue'

export const EventBus = mitt()

export function listenToAppEvent(name, handler) {
  EventBus.on(name, handler)
  onBeforeUnmount(() => EventBus.off(name, handler))
}
