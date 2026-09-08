'use client'

import { useState, useEffect } from 'react'

export interface BookmarkItem {
  id: string
  title: string
  url: string
  image?: string
  author?: string
  date?: string
  category?: string
}

const STORAGE_KEY = 'meridian:bookmarks'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setBookmarks(JSON.parse(saved))
      }
    } catch (e) {
      console.error(e)
    }
    setMounted(true)
  }, [])

  const toggleBookmark = (item: BookmarkItem) => {
    try {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.id === item.id)
        let updated: BookmarkItem[]
        if (exists) {
          updated = prev.filter((b) => b.id !== item.id)
        } else {
          updated = [item, ...prev]
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (e) {
      console.error(e)
    }
  }

  const isBookmarked = (id: string) => {
    return bookmarks.some((b) => b.id === id)
  }

  const clearBookmarks = () => {
    setBookmarks([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    bookmarks,
    count: mounted ? bookmarks.length : 0,
    toggleBookmark,
    isBookmarked,
    clearBookmarks,
    mounted,
  }
}
