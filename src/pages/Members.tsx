import { useEffect, useState } from "preact/hooks";
import {
  Button,
  Container,
  Dialog,
  DialogBody,
  DialogConfirm,
  DialogFooter,
  Heading,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text
} from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { User, authService } from "../services/auth-sqlite";

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
          password: formData.password
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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Edit User" : "Create User"}
      size="md"
    >
      <DialogBody>
        {error && (
          <div class="bg-red-500/10 backdrop-blur-sm border border-red-400/20 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div class="backdrop-blur-lg bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-200/50 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                👤 Full Name
              </label>
              <Input
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
                required
                class="bg-white/80 text-gray-900"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                ✉️ Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onInput={(e) => setFormData({ ...formData, email: (e.target as HTMLInputElement).value })}
                required
                class="bg-white/80 text-gray-900"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                👑 Role & Permissions
              </label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: (e.target as HTMLSelectElement).value as User["role"] })}
                options={[
                  { value: "user", label: "👤 User - Basic Access" },
                  { value: "manager", label: "👔 Manager - Extended Access" },
                  { value: "admin", label: "👑 Admin - Full Access" }
                ]}
                class="bg-white/80"
              />
            </div>

            {!user && (
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">
                  🔐 Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onInput={(e) => setFormData({ ...formData, password: (e.target as HTMLInputElement).value })}
                  required
                  placeholder="Minimum 6 characters"
                  class="bg-white/80 text-gray-900"
                />
              </div>
            )}
          </form>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit(new Event('submit'))}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : user ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default function Members() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { user: currentUser, hasRole, hasPermission } = useAuth();


  const canManageUsers = currentUser && (
    hasRole("admin") ||
    hasRole("manager") ||
    hasPermission("users.view")
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
      case "admin": return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 shadow-sm";
      case "manager": return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm";
      case "user": return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm";
      default: return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return "👑";
      case "manager": return "👔";
      case "user": return "👤";
      default: return "❓";
    }
  };

  if (!canManageUsers) {
    return (
      <Container size="xl">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="text-6xl mb-6 drop-shadow-lg">🔒</div>
            <Heading level={3} class="mb-3 text-gray-900">Access Denied</Heading>
            <Text class="text-gray-600 max-w-md mx-auto">
              You don't have permission to view the members page. Contact your administrator for access.
            </Text>
          </div>
        </div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container size="xl">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-spin border-4 border-transparent border-t-white mx-auto mb-6 shadow-lg"></div>
            <Text class="text-gray-600 text-lg">Loading team members...</Text>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Team Members</h1>
          <p class="text-gray-600">
            {users.length} {users.length === 1 ? 'member' : 'members'} total
          </p>
        </div>
        {(hasPermission("users.create") || hasRole("admin")) && (
          <Button onClick={handleCreateUser}>
            <span class="mr-2">➕</span>
            Add Member
          </Button>
        )}
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
          <div class="flex items-center">
            <span class="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHead>
            <TableRow class="bg-gray-50">
              <TableHeader class="font-semibold text-gray-900">User</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Role</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Created</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Last Login</TableHeader>
              <TableHeader class="font-semibold text-gray-900">Actions</TableHeader>
            </TableRow>
          </TableHead>
        <TableBody>
          {users.map((user, index) => (
            <TableRow 
              key={user.id} 
              class="hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
              style={`animation-delay: ${index * 50}ms`}
            >
              <TableCell>
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900">{user.name}</div>
                    <div class="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide ${getRoleColor(user.role)} transition-all hover:scale-105`}>
                  <span class="mr-1 text-sm">{getRoleIcon(user.role)}</span>
                  {user.role}
                </div>
              </TableCell>
              <TableCell>
                <div class="text-sm text-gray-600">
                  <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                  <div class="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class="text-sm text-gray-600">
                  {user.lastLogin ? (
                    <>
                      <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
                      <div class="text-xs text-gray-500">
                        {new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </>
                  ) : (
                    <div class="text-gray-400 italic">Never logged in</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div class="flex space-x-2">
                  {(hasPermission("users.edit") || hasRole("admin")) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                      class="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all hover:shadow-md mr-2"
                    >
                      ✏️ Edit
                    </Button>
                  )}
                  {(hasPermission("users.delete") || hasRole("admin")) &&
                    user.id !== currentUser?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(user.id)}
                        class="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all hover:shadow-md"
                      >
                        🗑️ Delete
                      </Button>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>

      {users.length === 0 && (
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="text-6xl mb-6">👥</div>
            <Heading level={3} class="mb-3 text-gray-900">No team members found</Heading>
            <Text class="text-gray-600 mb-6 max-w-md mx-auto">
              Your team is empty. Add your first team member to get started with user management.
            </Text>
            {(hasPermission("users.create") || hasRole("admin")) && (
              <Button onClick={handleCreateUser} class="mt-4">
                <span class="mr-2">➕</span>
                Add First Member
              </Button>
            )}
          </div>
        </div>
      )}

      <EditUserModal
        user={editingUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
      />

      <DialogConfirm
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteUser(deleteConfirm)}
        title="Confirm Delete"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </Container>
  );
}