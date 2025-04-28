import { useState, useEffect } from 'react'
import {
  Media,
  Theme,
  Quote,
  Gallery,
  Story,
  Tag,
  fetchMedia,
  fetchThemes,
  fetchQuotes,
  fetchGalleries,
  fetchStories,
  fetchTags,
  createRecord
} from '../services/airtable'

export const useContent = (contentType: 'media' | 'themes' | 'quotes' | 'galleries' | 'stories' | 'tags') => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFunctions = {
    media: fetchMedia,
    themes: fetchThemes,
    quotes: fetchQuotes,
    galleries: fetchGalleries,
    stories: fetchStories,
    tags: fetchTags
  }

  const tableNames = {
    media: 'Media',
    themes: 'Themes',
    quotes: 'Quotes',
    galleries: 'Galleries',
    stories: 'Stories',
    tags: 'Manual Tags'
  }

  useEffect(() => {
    loadContent()
  }, [contentType])

  const loadContent = async () => {
    try {
      setLoading(true)
      const fetchFn = fetchFunctions[contentType]
      const data = await fetchFn()
      setItems(data)
      setError(null)
    } catch (err) {
      setError('Failed to load content')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (item: any) => {
    try {
      const newItem = await createRecord(tableNames[contentType], item)
      if (newItem) {
        setItems((prev) => [...prev, newItem])
        return true
      }
      return false
    } catch (err) {
      setError('Failed to create item')
      console.error(err)
      return false
    }
  }

  return {
    items,
    loading,
    error,
    loadContent,
    addItem,
  }
} 