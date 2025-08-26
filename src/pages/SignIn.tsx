import { useState } from 'preact/hooks'
import { Button, Container, Form, FormActions, FormField, Heading, Input, Text } from '../components/ui'

interface SignInProps {
  onSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
}

export default function SignIn({ onSignIn }: SignInProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string) => (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '', general: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: '',
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const result = await onSignIn(formData.email, formData.password)

      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          general: result.error || 'Sign in failed',
        }))
      }
    } catch (_error) {
      setErrors((prev) => ({
        ...prev,
        general: 'An unexpected error occurred',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@postpos.com',
      password: 'admin123',
    })
    setErrors({ email: '', password: '', general: '' })
  }

  return (
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Container size="sm" padding="none" class="w-full max-w-md">
        <div class="bg-white rounded-lg shadow-lg p-8">
          {/* Logo and Title */}
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Text color="white" weight="bold" size="xl">
                P
              </Text>
            </div>
            <Heading level={1} size="2xl" color="primary">
              Post POS
            </Heading>
            <Text variant="caption" color="muted" class="mt-2">
              Sign in to your account
            </Text>
          </div>

          {/* Demo Credentials Helper - Remove in production */}
          {import.meta.env.DEV && (
            <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Text variant="small" color="primary" weight="medium" class="mb-2">
                Demo Credentials
              </Text>
              <Text variant="small" color="muted" class="mb-3">
                Email: admin@postpos.com
                <br />
                Password: admin123
              </Text>
              <Button variant="outline" size="sm" onClick={fillDemoCredentials} class="w-full">
                Use Demo Credentials
              </Button>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <Text variant="small" color="danger">
                {errors.general}
              </Text>
            </div>
          )}

          {/* Sign In Form */}
          <Form onSubmit={handleSubmit} spacing="lg">
            <FormField>
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onInput={handleInputChange('email')}
                error={errors.email}
                required
              />
            </FormField>

            <FormField>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onInput={handleInputChange('password')}
                error={errors.password}
                required
              />
            </FormField>

            <FormActions align="center">
              <Button type="submit" variant="primary" size="lg" disabled={isLoading} class="w-full">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </FormActions>
          </Form>

          {/* Footer */}
          <div class="mt-8 pt-6 border-t border-gray-200 text-center">
            <Text variant="small" color="muted">
              © 2025 Post POS. All rights reserved.
            </Text>
          </div>
        </div>
      </Container>
    </div>
  )
}
