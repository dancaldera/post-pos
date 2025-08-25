import { useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";
import { Button, Input } from "../components/ui";

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Application Settings</h3>
        
        <div class="mb-8">
          <h4 class="text-md font-medium mb-4">Tauri Greeting Demo</h4>
          <form
            class="flex gap-4 mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              greet();
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
            <p class="text-center text-lg font-medium text-green-600 bg-green-50 p-4 rounded-lg">
              {greetMsg}
            </p>
          )}
        </div>

        <div>
          <h4 class="text-md font-medium mb-4">System Settings</h4>
          <p class="text-gray-600 mb-4">Configure your POS system preferences here.</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h4 class="text-md font-medium mb-4">🛠️ Developer Tools</h4>
        <p class="text-gray-600 mb-4">
          Tools and utilities for development and testing.
        </p>
        
        <Button 
          variant="outline" 
          onClick={() => onNavigate('component-showcase')}
        >
          🎨 UI Components Showcase
        </Button>
      </div>
    </div>
  );
}