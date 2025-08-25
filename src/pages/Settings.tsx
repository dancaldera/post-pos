import { useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";

export default function Settings() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
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
          <input
            id="greet-input"
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            type="submit"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Greet
          </button>
        </form>
        
        {greetMsg && (
          <p class="text-center text-lg font-medium text-green-600 bg-green-50 p-4 rounded-lg">
            {greetMsg}
          </p>
        )}
      </div>

      <div>
        <h4 class="text-md font-medium mb-4">System Settings</h4>
        <p class="text-gray-600">Configure your POS system preferences here.</p>
      </div>
    </div>
  );
}