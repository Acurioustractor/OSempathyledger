import { useState, useEffect } from 'react'
import { Story, fetchStories, createStory } from '../services/airtable'

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setLoading(true)
      const data = await fetchStories()
      setStories(data)
      setError(null)
    } catch (err) {
      setError('Failed to load stories')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addStory = async (story: Omit<Story, 'id' | 'created_at'>) => {
    try {
      const newStory = await createStory(story)
      if (newStory) {
        setStories((prev) => [...prev, newStory])
        return true
      }
      return false
    } catch (err) {
      setError('Failed to create story')
      console.error(err)
      return false
    }
  }

  return {
    stories,
    loading,
    error,
    loadStories,
    addStory,
  }
} 