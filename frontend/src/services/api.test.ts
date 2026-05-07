import { describe, it, expect } from 'vitest'
import { healthCheck } from './api'

describe('API Service (local calculations)', () => {
  it('healthCheck returns ok status', async () => {
    const result = await healthCheck()
    expect(result.status).toBe('ok')
  })
})
