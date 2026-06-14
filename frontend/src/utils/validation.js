// ═══════════════════════════════════════════════════════
// Validation Module — Parliament Chat
// All form validation rules with detailed error messages
// ═══════════════════════════════════════════════════════

// ── USERNAME ─────────────────────────────────────────────
// 2-20 chars, letters/numbers/underscore, no spaces
const USERNAME_REGEX = /^[a-zA-Z0-9_]{2,20}$/

export function validateUsername(username) {
  if (!username || !username.trim()) {
    return { valid: false, message: 'Username is required' }
  }
  if (username.trim().length < 2) {
    return { valid: false, message: 'Username must be at least 2 characters' }
  }
  if (username.trim().length > 20) {
    return { valid: false, message: 'Username must be less than 20 characters' }
  }
  if (/\s/.test(username)) {
    return { valid: false, message: 'Username cannot contain spaces' }
  }
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers and underscores' }
  }
  return { valid: true, message: '' }
}

// ── EMAIL ─────────────────────────────────────────────────
// Standard email format with domain validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Email is required' }
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { valid: false, message: 'Please enter a valid email address' }
  }
  // Check for common mistakes
  if (email.includes('..')) {
    return { valid: false, message: 'Email cannot contain consecutive dots' }
  }
  return { valid: true, message: '' }
}

// ── PHONE ─────────────────────────────────────────────────
// International format with country code
// Accepts: +250790110231, 0790110231, +1 (555) 123-4567
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/
const DIGITS_ONLY = /\d/g

export function validatePhone(phone) {
  if (!phone || !phone.trim()) {
    return { valid: false, message: 'Phone number is required' }
  }
  if (!PHONE_REGEX.test(phone.trim())) {
    return { valid: false, message: 'Please enter a valid phone number' }
  }
  // Must have at least 7 digits
  const digits = phone.match(DIGITS_ONLY)
  if (!digits || digits.length < 7) {
    return { valid: false, message: 'Phone number must have at least 7 digits' }
  }
  if (digits.length > 15) {
    return { valid: false, message: 'Phone number is too long' }
  }
  return { valid: true, message: '' }
}

// ── PASSWORD ──────────────────────────────────────────────
// Min 8 chars, uppercase, lowercase, number, special char
// Uses lookahead — advanced regex technique

// Each rule is a separate regex for clear error messages
const PASSWORD_RULES = [
  {
    regex: /.{8,}/,
    message: 'At least 8 characters',
    key: 'length'
  },
  {
    // Lookahead — checks for uppercase without consuming chars
    regex: /(?=.*[A-Z])/,
    message: 'At least one uppercase letter (A-Z)',
    key: 'uppercase'
  },
  {
    // Lookahead — checks for lowercase
    regex: /(?=.*[a-z])/,
    message: 'At least one lowercase letter (a-z)',
    key: 'lowercase'
  },
  {
    // Lookahead — checks for number
    regex: /(?=.*\d)/,
    message: 'At least one number (0-9)',
    key: 'number'
  },
  {
    // Lookahead — checks for special character
    regex: /(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/,
    message: 'At least one special character (!@#$%^&*)',
    key: 'special'
  },
]

// Advanced regex — full password using lookaheads chained together
// Each (?=...) is a lookahead that checks a condition without moving forward
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/

export function validatePassword(password) {
  if (!password) {
    return {
      valid: false,
      message: 'Password is required',
      strength: 0,
      strengthLabel: '',
      rules: PASSWORD_RULES.map(r => ({ ...r, passed: false }))
    }
  }

  // Check each rule
  const checkedRules = PASSWORD_RULES.map(rule => ({
    ...rule,
    passed: rule.regex.test(password)
  }))

  const passedCount = checkedRules.filter(r => r.passed).length

  // Calculate strength score 0-4
  const strength = passedCount

  // Strength labels
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981']
  const strengthLabel = strengthLabels[Math.min(strength, 4)] || ''
  const strengthColor = strengthColors[Math.min(strength, 4)] || ''

  const failedRules = checkedRules.filter(r => !r.passed)
  const isValid = STRONG_PASSWORD_REGEX.test(password)

  return {
    valid: isValid,
    message: failedRules.length > 0 ? failedRules[0].message : '',
    strength: Math.min(strength, 4),
    strengthLabel,
    strengthColor,
    rules: checkedRules,
  }
}

// ── CONFIRM PASSWORD ──────────────────────────────────────
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return { valid: false, message: 'Please confirm your password' }
  }
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' }
  }
  return { valid: true, message: '' }
}

// ── FULL REGISTER FORM VALIDATION ─────────────────────────
export function validateRegisterForm(formData) {
  const errors = {}

  const usernameResult = validateUsername(formData.username)
  if (!usernameResult.valid) errors.username = usernameResult.message

  const emailResult = validateEmail(formData.email)
  if (!emailResult.valid) errors.email = emailResult.message

  const phoneResult = validatePhone(formData.phone)
  if (!phoneResult.valid) errors.phone = phoneResult.message

  const passwordResult = validatePassword(formData.password)
  if (!passwordResult.valid) errors.password = passwordResult.message

  const confirmResult = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  )
  if (!confirmResult.valid) errors.confirmPassword = confirmResult.message

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

// ── FULL LOGIN FORM VALIDATION ────────────────────────────
export function validateLoginForm(formData) {
  const errors = {}

  const emailResult = validateEmail(formData.email)
  if (!emailResult.valid) errors.email = emailResult.message

  if (!formData.password) {
    errors.password = 'Password is required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

// ── REAL-TIME FIELD VALIDATION ────────────────────────────
// Validates a single field by name — used for live feedback
export function validateField(name, value, formData = {}) {
  switch (name) {
    case 'username':       return validateUsername(value)
    case 'email':          return validateEmail(value)
    case 'phone':          return validatePhone(value)
    case 'password':       return validatePassword(value)
    case 'confirmPassword':
      return validateConfirmPassword(formData.password, value)
    default:
      return { valid: true, message: '' }
  }
}