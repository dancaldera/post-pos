import { useState } from "preact/hooks";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "sales", label: "Sales", icon: "💰" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "inventory", label: "Inventory", icon: "📋" },
    { id: "customers", label: "Customers", icon: "👥" },
    { id: "reports", label: "Reports", icon: "📈" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div class={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div class="p-4">
        <div class="flex items-center justify-between">
          {!isCollapsed && (
            <h1 class="text-xl font-bold text-blue-400">Post POS</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            class="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>
      </div>

      <nav class="mt-8">
        <ul class="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                class={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isCollapsed ? "justify-center" : "space-x-3"
                } ${
                  currentPage === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span class="text-xl">{item.icon}</span>
                {!isCollapsed && (
                  <span class="font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  );
}