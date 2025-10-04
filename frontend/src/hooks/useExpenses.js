import { useEffect, useState } from 'react'
import { listExpenses } from '../services/expenseService.js'

export function useExpenses(token) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function run() {
      setLoading(true)
      try {
        const data = await listExpenses(token)
        setItems(data)
      } catch (e) {
        setError('Failed to fetch expenses')
      } finally {
        setLoading(false)
      }
    }
    if (token) run()
  }, [token])

  return { items, loading, error }
}
