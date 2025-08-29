import { invoke } from '@tauri-apps/api/core'
import { useEffect, useState } from 'preact/hooks'
import { 
  Button, 
  Container, 
  Heading, 
  Input, 
  Text, 
  Select,
  Dialog,
  DialogBody,
  DialogFooter
} from '../components/ui'
import { 
  type CompanySettings, 
  companySettingsService, 
  SUPPORTED_LANGUAGES, 
  SUPPORTED_CURRENCIES 
} from '../services/company-settings-sqlite'

interface SettingsProps {
  onNavigate: (page: string) => void
}

export default function Settings({ onNavigate }: SettingsProps) {
  const [greetMsg, setGreetMsg] = useState('')
  const [name, setName] = useState('')
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const companySettings = await companySettingsService.getSettings()
      setSettings(companySettings)
      setError('')
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSetting = async (field: keyof CompanySettings, value: any) => {
    if (!settings) return

    try {
      setIsUpdating(true)
      const result = await companySettingsService.updateSettings({ [field]: value })
      
      if (result.success && result.settings) {
        setSettings(result.settings)
        setSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`)
        setError('')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to update setting')
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to update setting')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResetToDefaults = async () => {
    try {
      setIsUpdating(true)
      const result = await companySettingsService.resetToDefaults()
      
      if (result.success && result.settings) {
        setSettings(result.settings)
        setSuccess('Settings reset to defaults successfully')
        setError('')
        setIsResetDialogOpen(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to reset settings')
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to reset settings')
    } finally {
      setIsUpdating(false)
    }
  }

  async function greet() {
    setGreetMsg(await invoke('greet', { name }))
  }

  if (isLoading) {
    return (
      <Container size="xl">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-center py-8">
            <div class="w-8 h-8 bg-blue-600 rounded-full animate-spin border-2 border-transparent border-t-white mx-auto mb-4"></div>
            <p class="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container size="xl">
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <Heading level={3}>Application Settings</Heading>
            <Text class="text-gray-600">Configure your POS system preferences and company information.</Text>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsResetDialogOpen(true)}
            disabled={isUpdating}
            class="text-red-600 border-red-200 hover:bg-red-50"
          >
            🔄 Reset to Defaults
          </Button>
        </div>

        {error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {settings && (
          <div class="space-y-8">
            {/* Company Information */}
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Heading level={4} class="mb-6">🏢 Company Information</Heading>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Company Name"
                    value={settings.name}
                    onBlur={(e) => handleUpdateSetting('name', (e.target as HTMLInputElement).value)}
                    disabled={isUpdating}
                    placeholder="Enter company name"
                    class="mb-2"
                  />
                  <Text class="text-sm text-gray-500">The name of your business</Text>
                </div>
                <div>
                  <Input
                    label="Description"
                    value={settings.description}
                    onBlur={(e) => handleUpdateSetting('description', (e.target as HTMLInputElement).value)}
                    disabled={isUpdating}
                    placeholder="Enter company description"
                    class="mb-2"
                  />
                  <Text class="text-sm text-gray-500">Brief description of your business</Text>
                </div>
                <div>
                  <Input
                    label="Address"
                    value={settings.address || ''}
                    onBlur={(e) => handleUpdateSetting('address', (e.target as HTMLInputElement).value || null)}
                    disabled={isUpdating}
                    placeholder="Enter business address"
                    class="mb-2"
                  />
                  <Text class="text-sm text-gray-500">Physical address of your business</Text>
                </div>
                <div>
                  <Input
                    label="Phone"
                    value={settings.phone || ''}
                    onBlur={(e) => handleUpdateSetting('phone', (e.target as HTMLInputElement).value || null)}
                    disabled={isUpdating}
                    placeholder="Enter phone number"
                    class="mb-2"
                  />
                  <Text class="text-sm text-gray-500">Business phone number</Text>
                </div>
                <div>
                  <Input
                    label="Email"
                    type="email"
                    value={settings.email || ''}
                    onBlur={(e) => handleUpdateSetting('email', (e.target as HTMLInputElement).value || null)}
                    disabled={isUpdating}
                    placeholder="Enter email address"
                    class="mb-2"
                  />
                  <Text class="text-sm text-gray-500">Business email address</Text>
                </div>
                <div>
                  <Input
                    label="Website"
                    type="text"
                    value={settings.website || ''}
                    onBlur={(e) => handleUpdateSetting('website', (e.target as HTMLInputElement).value || null)}
                    disabled={isUpdating}
                    placeholder="https://example.com"
                    class="mb-2"
                  />
                  <Text class="text-sm text-gray-500">Business website URL</Text>
                </div>
              </div>
            </div>

            {/* Tax Configuration */}
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Heading level={4} class="mb-6">💰 Tax Configuration</Heading>
              <div class="space-y-6">
                <div class="flex items-center space-x-4">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.taxEnabled}
                      onChange={(e) => handleUpdateSetting('taxEnabled', (e.target as HTMLInputElement).checked)}
                      disabled={isUpdating}
                      class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Text class="font-medium">Enable Tax Calculation</Text>
                  </label>
                </div>
                {settings.taxEnabled && (
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        label="Tax Percentage"
                        type="number"
                        value={settings.taxPercentage.toString()}
                        onBlur={(e) => handleUpdateSetting('taxPercentage', parseFloat((e.target as HTMLInputElement).value) || 0)}
                        disabled={isUpdating}
                        class="mb-2"
                        placeholder="10.0"
                      />
                      <Text class="text-sm text-gray-500">Tax rate as a percentage (0-100, e.g., 10.5)</Text>
                    </div>
                    <div class="flex items-center mt-6">
                      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <Text class="text-sm text-blue-700">
                          Current tax rate: <span class="font-bold">{settings.taxPercentage}%</span>
                        </Text>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* System Preferences */}
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Heading level={4} class="mb-6">⚙️ System Preferences</Heading>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Select
                    label="Currency Symbol"
                    value={settings.currencySymbol}
                    onChange={(e) => handleUpdateSetting('currencySymbol', (e.target as HTMLSelectElement).value)}
                    disabled={isUpdating}
                    options={SUPPORTED_CURRENCIES.map(currency => ({
                      value: currency.symbol,
                      label: `${currency.symbol} - ${currency.name}`
                    }))}
                    class="mb-2"
                  />
                  <Text class="text-sm text-gray-500">Currency symbol displayed on receipts and orders</Text>
                </div>
                <div>
                  <Select
                    label="Language"
                    value={settings.language}
                    onChange={(e) => handleUpdateSetting('language', (e.target as HTMLSelectElement).value)}
                    disabled={isUpdating}
                    options={SUPPORTED_LANGUAGES.map(lang => ({
                      value: lang.code,
                      label: lang.name
                    }))}
                    class="mb-2"
                  />
                  <Text class="text-sm text-gray-500">Interface language (requires restart)</Text>
                </div>
              </div>
            </div>

            {/* Developer Tools */}
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Heading level={4} class="mb-6">🛠️ Developer Tools</Heading>
              <Text class="mb-4 text-gray-600">Tools and utilities for development and testing.</Text>

              <div class="space-y-4">
                <div>
                  <Heading level={5}>API Testing</Heading>
                  <form
                    class="flex gap-4 mb-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      greet()
                    }}
                  >
                    <Input
                      placeholder="Enter a name..."
                      value={name}
                      onInput={(e) => setName((e.target as HTMLInputElement).value)}
                      class="flex-1"
                    />
                    <Button type="submit" variant="primary">
                      Greet
                    </Button>
                  </form>

                  {greetMsg && (
                    <p class="text-center text-lg font-medium text-green-600 bg-green-50 p-4 rounded-lg">{greetMsg}</p>
                  )}
                </div>

                <Button variant="outline" onClick={() => onNavigate('component-showcase')}>
                  🎨 UI Components Showcase
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog 
        isOpen={isResetDialogOpen} 
        onClose={() => setIsResetDialogOpen(false)} 
        title="Reset Settings to Defaults"
        size="md"
      >
        <DialogBody>
          <div class="space-y-4">
            <div class="flex items-center space-x-3 text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <span class="text-2xl">⚠️</span>
              <div>
                <Text class="font-semibold">Warning: This action cannot be undone</Text>
                <Text class="text-sm text-amber-700">All your custom settings will be reset to their default values.</Text>
              </div>
            </div>
            <Text class="text-gray-700">
              This will reset the following settings to their default values:
            </Text>
            <ul class="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
              <li>Company name and description</li>
              <li>Tax configuration (enabled with 10% rate)</li>
              <li>Currency symbol (USD $)</li>
              <li>Language (English)</li>
              <li>All contact information</li>
            </ul>
            <Text class="text-gray-700 font-medium">
              Are you sure you want to proceed?
            </Text>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsResetDialogOpen(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResetToDefaults}
            disabled={isUpdating}
            class="bg-red-600 hover:bg-red-700 text-white"
          >
            {isUpdating ? 'Resetting...' : 'Reset Settings'}
          </Button>
        </DialogFooter>
      </Dialog>
    </Container>
  )
}
