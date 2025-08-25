import { useState, useEffect } from "preact/hooks";
import { Button, Input } from "../components/ui";
import { User, authService } from "../services/auth";
import { useAuth } from "../hooks/useAuth";

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as User["role"],
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: ""
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        email: "",
        role: "user",
        password: ""
      });
    }
    setError("");
  }, [user, isOpen]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let result;
      if (user) {
        result = await authService.updateUser(user.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role
        });
      } else {
        result = await authService.createUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          permissions: []
        });
      }

      if (result.success && result.user) {
        onSave(result.user);
        onClose();
      } else {
        setError(result.error || "An error occurred");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">
          {user ? "Edit User" : "Create User"}
        </h3>
        
        {error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <Input
              value={formData.name}
              onInput={(e) => setFormData({...formData, name: (e.target as HTMLInputElement).value})}
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onInput={(e) => setFormData({...formData, email: (e.target as HTMLInputElement).value})}
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: (e.target as HTMLSelectElement).value as User["role"]})}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {!user && (
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={formData.password}
                onInput={(e) => setFormData({...formData, password: (e.target as HTMLInputElement).value})}
                required
                placeholder="Minimum 6 characters"
              />
            </div>
          )}

          <div class="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : user ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Members() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const { user: currentUser } = useAuth();

  const canManageUsers = currentUser && (
    authService.hasPermission("users.view") || 
    authService.hasRole("admin") ||
    authService.hasRole("manager")
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!canManageUsers) {
      setError("You don't have permission to view users");
      setIsLoading(false);
      return;
    }

    try {
      const usersList = await authService.getUsers();
      setUsers(usersList);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await authService.deleteUser(userId);
      if (result.success) {
        setUsers(users.filter(u => u.id !== userId));
        setDeleteConfirm(null);
      } else {
        setError(result.error || "Failed to delete user");
      }
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const handleSaveUser = (savedUser: User) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
    } else {
      setUsers([...users, savedUser]);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "user": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!canManageUsers) {
    return (
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-center py-8">
          <div class="text-4xl mb-4">🔒</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p class="text-gray-600">You don't have permission to view the members page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-center py-8">
          <div class="w-8 h-8 bg-blue-600 rounded-full animate-spin border-2 border-transparent border-t-white mx-auto mb-4"></div>
          <p class="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-lg font-semibold">Members</h3>
            <p class="text-gray-600">Manage system users and their roles</p>
          </div>
          {(authService.hasPermission("users.create") || authService.hasRole("admin")) && (
            <Button onClick={handleCreateUser}>
              <span class="mr-2">👤</span>
              Add User
            </Button>
          )}
        </div>

        {error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-medium text-gray-700">User</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-4">
                    <div>
                      <div class="font-medium text-gray-900">{user.name}</div>
                      <div class="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span class={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex space-x-2">
                      {(authService.hasPermission("users.edit") || authService.hasRole("admin")) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                      )}
                      {(authService.hasPermission("users.delete") || authService.hasRole("admin")) && 
                       user.id !== currentUser?.id && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteConfirm(user.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div class="text-center py-8">
              <div class="text-4xl mb-4">👤</div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p class="text-gray-600">Get started by adding your first user.</p>
            </div>
          )}
        </div>
      </div>

      <EditUserModal
        user={editingUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
      />

      {deleteConfirm && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div class="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteUser(deleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}