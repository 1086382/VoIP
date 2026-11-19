import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { combineURLs } from '../../../src/helper.js'

describe('combineURLs', () => {
  it('joins the API base and path with a single slash', () => {
    assert.equal(combineURLs('https://example.invalid/', '/api/', '/auth/login'),
      'https://example.invalid/api/auth/login')
  })

  it('builds a relative URL when the API shares the page origin', () => {
    assert.equal(combineURLs('', '/api'), '/api')
  })
})
