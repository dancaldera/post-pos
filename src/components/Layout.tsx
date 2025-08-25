import { useState } from "preact/hooks";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: any;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div class="flex h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="flex items-center justify-between px-6 py-4">
            <div>
              <h2 class="text-2xl font-semibold text-gray-800 capitalize">
                {currentPage}
              </h2>
              <p class="text-sm text-gray-600 mt-1">
                Welcome to your POS dashboard
              </p>
            </div>
            
            <div class="flex items-center space-x-4">
              <button class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                <span class="text-xl">🔔</span>
                <span class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div class="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    A
                  </div>
                  <div class="flex flex-col items-start">
                    <span class="font-medium">Admin User</span>
                    <span class="text-xs text-gray-500">admin@postpos.com</span>
                  </div>
                  <span class={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {isDropdownOpen && (
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div class="py-2">
                      <div class="px-4 py-3 border-b border-gray-100">
                        <p class="text-sm font-medium text-gray-900">Admin User</p>
                        <p class="text-sm text-gray-500">admin@postpos.com</p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          onNavigate('settings');
                          setIsDropdownOpen(false);
                        }}
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <span>⚙️</span>
                        <span>Settings</span>
                      </button>
                      
                      <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <span>👤</span>
                        <span>Profile</span>
                      </button>
                      
                      <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <span>🔒</span>
                        <span>Privacy</span>
                      </button>
                      
                      <div class="border-t border-gray-100 mt-2 pt-2">
                        <button class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                          <span>🚪</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main class="flex-1 overflow-x-hidden overflow-y-auto">
          <div class="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}