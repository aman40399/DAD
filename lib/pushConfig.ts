// VAPID credentials for Singh Monster Web Push notifications
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BIE8TmvlBTfDVKgEbX5CCuG9KIOslcEf6ydnzJFQS2I3VAh8wqPYTUGqDlbsI6TVZSYl49DR1lycKRDQxIv6vTg'

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || ''

export const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:admin@singhmonster.com'

/**
 * Converts a base64 string to a Uint8Array for PushManager registration
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
