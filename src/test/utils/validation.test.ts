import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidPassword,
  isValidAmount,
  validateLoginForm,
  validateSignUpForm,
  validateSendMoneyForm,
} from '../../utils/validation'

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      expect(isValidPassword('Password123')).toBe(true)
      expect(isValidPassword('MySecure1Pass')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(isValidPassword('password')).toBe(false) // no uppercase, no number
      expect(isValidPassword('PASSWORD')).toBe(false) // no lowercase, no number
      expect(isValidPassword('Password')).toBe(false) // no number
      expect(isValidPassword('Pass1')).toBe(false) // too short
    })
  })

  describe('isValidAmount', () => {
    it('should validate positive amounts', () => {
      expect(isValidAmount('100')).toBe(true)
      expect(isValidAmount('0.01')).toBe(true)
      expect(isValidAmount(50.5)).toBe(true)
    })

    it('should reject invalid amounts', () => {
      expect(isValidAmount('0')).toBe(false)
      expect(isValidAmount('-10')).toBe(false)
      expect(isValidAmount('abc')).toBe(false)
      expect(isValidAmount('1000001')).toBe(false) // too large
    })
  })

  describe('validateLoginForm', () => {
    it('should pass valid login form', () => {
      const form = { email: 'test@example.com', password: 'password123' }
      const errors = validateLoginForm(form)
      expect(errors).toHaveLength(0)
    })

    it('should catch invalid email', () => {
      const form = { email: 'invalid-email', password: 'password123' }
      const errors = validateLoginForm(form)
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('email')
    })

    it('should catch missing password', () => {
      const form = { email: 'test@example.com', password: '' }
      const errors = validateLoginForm(form)
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('password')
    })
  })
})