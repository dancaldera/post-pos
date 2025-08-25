export default function Dashboard() {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Sales</p>
            <p class="text-2xl font-bold text-gray-900">$12,345</p>
          </div>
          <div class="text-3xl">💰</div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Orders Today</p>
            <p class="text-2xl font-bold text-gray-900">47</p>
          </div>
          <div class="text-3xl">📦</div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Customers</p>
            <p class="text-2xl font-bold text-gray-900">1,234</p>
          </div>
          <div class="text-3xl">👥</div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Revenue</p>
            <p class="text-2xl font-bold text-gray-900">$45,678</p>
          </div>
          <div class="text-3xl">📈</div>
        </div>
      </div>
    </div>
  );
}