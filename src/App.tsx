import { useState } from "preact/hooks";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ComponentShowcase from "./pages/ComponentShowcase";
import "./App.css"

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "sales":
        return <Sales />;
      case "products":
        return <Products />;
      case "inventory":
        return <Inventory />;
      case "customers":
        return <Customers />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings onNavigate={handleNavigate} />;
      case "component-showcase":
        return <ComponentShowcase />;
      default:
        return (
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4 capitalize">{currentPage}</h3>
            <p class="text-gray-600">This page is under construction.</p>
          </div>
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}

export default App;
