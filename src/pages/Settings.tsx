import { invoke } from '@tauri-apps/api/core'
import { useState } from 'preact/hooks'
import { Button, Container, Heading, Input, Text } from '../components/ui'

interface SettingsProps {
  onNavigate: (page: string) => void
}

export default function Settings({ onNavigate }: SettingsProps) {
  const [greetMsg, setGreetMsg] = useState('')
  const [name, setName] = useState('')

  async function greet() {
    setGreetMsg(await invoke('greet', { name }))
  }

  return (
    <Container size="xl">
      <Heading level={3}>Application Settings</Heading>
      <div class="my-4">
        <Heading level={4}>System Settings</Heading>
        <Text>Configure your POS system preferences here.</Text>
      </div>

      <Heading level={4}>🛠️ Developer Tools</Heading>
      <Text class="mb-4">Tools and utilities for development and testing.</Text>

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
    </Container>
  )
}
