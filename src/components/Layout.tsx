import { useState } from "preact/hooks";
import Sidebar, { SidebarNav, SidebarItem, SidebarGroup } from "./ui/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { Button, Heading, Text } from "./ui";

interface LayoutProps {
  children: any;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "sales", label: "Sales", icon: "💰" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "inventory", label: "Inventory", icon: "📋" },
    { id: "customers", label: "Customers", icon: "👥" },
    { id: "reports", label: "Reports", icon: "📈" },
    { id: "members", label: "Members", icon: "👤" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ].filter(item => {
    if (item.id === "members") {
      return user && (user.role === "admin" || user.role === "manager");
    }
    return true;
  });

  return (
    <div class="flex h-screen bg-gray-100">
      <Sidebar width="md" backgroundColor="dark" collapsible defaultCollapsed={false}>
        {({ isCollapsed }: { isCollapsed: boolean }) => (
          <SidebarNav>
            <SidebarGroup title="Navigation" isCollapsed={isCollapsed}>
              {menuItems.map((item) => (
                <SidebarItem 
                  key={item.id}
                  item={{ 
                    ...item,
                    active: currentPage === item.id,
                    onClick: () => onNavigate(item.id)
                  }}
                  isCollapsed={isCollapsed}
                />
              ))}
            </SidebarGroup>
          </SidebarNav>
        )}
      </Sidebar>
      
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="flex items-center justify-between px-6 py-4">
            <div>
              <Heading>
                {menuItems.find((item) => item.id === currentPage)?.label}
              </Heading>
              <Text>
                Welcome to your POS dashboard
              </Text>
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
                    <span class="font-medium">{user?.name || "User"}</span>
                    <span class="text-xs text-gray-500">{user?.email}</span>
                  </div>
                  <span class={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {isDropdownOpen && (
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div class="p-2">                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          onNavigate('settings');
                          setIsDropdownOpen(false);
                        }}
                        class="w-full"
                      >
                        <span>⚙️</span>
                        <span>Settings</span>
                      </Button>
                      
                      <div class="border-t border-gray-100 mt-2 pt-2">
                        <Button 
                          variant="danger"
                          onClick={() => {
                            signOut();
                            setIsDropdownOpen(false);
                          }}
                          class="w-full"
                        >
                          <span>🚪</span>
                          <span>Sign Out</span>
                        </Button>
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