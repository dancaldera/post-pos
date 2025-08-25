import { useState, useEffect } from "preact/hooks";
import preactLogo from "./assets/preact.svg";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css"

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    // Optional: Add decorations back after component mounts for better transparency support
    const setupWindow = async () => {
      const appWindow = getCurrentWindow();
      try {
        await appWindow.setDecorations(true);
      } catch (error) {
        console.log("Could not set decorations:", error);
      }
    };
    setupWindow();
  }, []);

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main class="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div class="max-w-2xl w-full bg-white/90 backdrop-blur-lg rounded-lg shadow-2xl border-2 border-gray-300/50 p-8">
        <h1 class="text-4xl font-bold text-center text-gray-800 mb-8">
          Welcome to Tauri + Preact
        </h1>

        <div class="flex justify-center items-center space-x-8 mb-8">
          <a href="https://vitejs.dev" target="_blank" class="transition-transform hover:scale-110">
            <img src="/vite.svg" class="w-16 h-16" alt="Vite logo" />
          </a>
          <a href="https://tauri.app" target="_blank" class="transition-transform hover:scale-110">
            <img src="/tauri.svg" class="w-16 h-16" alt="Tauri logo" />
          </a>
          <a href="https://preactjs.com" target="_blank" class="transition-transform hover:scale-110">
            <img src={preactLogo} class="w-16 h-16" alt="Preact logo" />
          </a>
        </div>
        
        <p class="text-center text-gray-600 mb-8">
          Click on the Tauri, Vite, and Preact logos to learn more.
        </p>

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
    </main>
  );
}

export default App;
