import { describe, it, expect } from 'vitest'
import { ensureCorrelationId, healthInfo, sharedVersion } from '../src/index'

describe('shared-lib basics', () => {
  it('generates correlation id when missing', () => {
    const id = ensureCorrelationId()
    expect(id).toMatch(/^req_[a-z0-9]+\d+$/)
  })
  it('healthInfo contains service and version', () => {
    const h = healthInfo('test')
    expect(h.service).toBe('test')
    expect(h.sharedVersion).toBe(sharedVersion)
  })
})
