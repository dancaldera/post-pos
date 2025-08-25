import { useState } from "preact/hooks";
import Sidebar, { SidebarNav, SidebarItem, SidebarGroup } from "./ui/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { Button, Heading, Text } from "./ui";

/**
 * Props for the Layout component
 * @interface LayoutProps
 * @property {any} children - The content to be rendered within the layout
 * @property {string} currentPage - The currently active page identifier
 * @property {(page: string) => void} onNavigate - Callback function for navigation events
 */
interface LayoutProps {
  children: any;
  currentPage: string;
  onNavigate: (page: string) => void;
}

/**
 * Main application layout component that provides the overall structure
 * including sidebar navigation, header with user controls, and content area.
 * 
 * Features:
 * - Responsive sidebar with collapsible navigation
 * - Role-based menu item filtering (e.g., Members section for admins/managers only)
 * - User profile dropdown with settings and logout
 * - Notification bell with badge indicator
 * - Dynamic page title based on current route
 * 
 * @component
 * @param {LayoutProps} props - Component properties
 * @returns {JSX.Element} The complete application layout structure
 */
export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  /**
   * State for controlling the user profile dropdown visibility
   * @type {[boolean, function]} isDropdownOpen - Dropdown open state and setter
   */
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  /**
   * Authentication context providing user information and signOut function
   * @type {object} auth - Authentication context object
   * @property {object|null} user - Current authenticated user information
   * @property {function} signOut - Function to sign out the current user
   */
  const { user, signOut } = useAuth();

  /**
   * Navigation menu items configuration with role-based filtering
   * Filters out 'Members' menu item for non-admin/non-manager users
   * @type {Array<{id: string, label: string, icon: string}>}
   */
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", description: "Overview of store performance and analytics" },
    { id: "orders", label: "Orders", icon: "📋", description: "Manage customer orders and transactions" },
    { id: "products", label: "Products", icon: "📦", description: "Product catalog and inventory management" },
    { id: "customers", label: "Customers", icon: "👥", description: "Customer database and relationship management" },
    { id: "members", label: "Members", icon: "👤", description: "Staff member management and permissions" },
    { id: "settings", label: "Settings", icon: "⚙️", description: "Application configuration and preferences" },
  ].filter(item => {
    // Filter out Members section for non-admin/non-manager users
    if (item.id === "members") {
      return user && (user.role === "admin" || user.role === "manager");
    }
    return true;
  });

  return (
    // Main layout container with sidebar and content area
    // Uses flexbox for responsive sidebar + content layout
    <div class="flex h-screen bg-gray-100">
      {/* 
        Sidebar component with dark theme and collapsible functionality
        @param {string} width - Sidebar width (md: medium)
        @param {string} backgroundColor - Background color theme
        @param {boolean} collapsible - Whether sidebar can be collapsed
        @param {boolean} defaultCollapsed - Initial collapsed state
      */}
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
      
      {/* Main content area with header and scrollable content */}
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* 
          Application header with page title, notifications, and user profile
          Features white background with subtle shadow and border
        */}
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="flex items-center justify-between px-6 py-4">
            <div>
              <Heading>
                {menuItems.find((item) => item.id === currentPage)?.label}
              </Heading>
              <Text>
                {menuItems.find((item) => item.id === currentPage)?.description}
              </Text>
            </div>
            
            {/* Header right section with notifications and user profile */}
            <div class="flex items-center space-x-4">
              {/* 
                User profile dropdown component
                Contains user avatar, name, email, and dropdown menu
              */}
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

                {/* 
                  Dropdown menu that appears when user profile is clicked
                  Contains navigation to settings and sign out functionality
                  Positioned absolutely below the profile button
                */}
                {isDropdownOpen && (
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div class="p-2">                      
                      {/* Settings navigation button */}
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
                      
                      {/* Sign out section with visual separator */}
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

        {/* 
          Main content area with scrollable container
          Uses container class for proper horizontal centering and padding
        */}
        <main class="flex-1 overflow-x-hidden overflow-y-auto">
          <div class="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
