import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SessionExpired } from "@/components/auth/session-expired";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Mail, 
  Calendar,
  Filter
} from "lucide-react";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "learner" as "admin" | "instructor" | "learner"
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAddUserOpen(false);
      setNewUser({ firstName: "", lastName: "", email: "", role: "learner" });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const payload = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      };
      const response = await apiRequest("PUT", `/api/admin/users/${userData.id}`, payload);
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditUserOpen(false);
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const filteredUsers = Array.isArray(users) 
    ? users.filter((u) => {
        const matchesSearch = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
      })
    : [];

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-white">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <AdminHeader />
      
      <div className="container py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">User Management</h1>
            <p className="text-gray-200 mt-1 drop-shadow-sm">Manage platform users and their roles</p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/60 backdrop-blur-xl border border-white/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Add New User</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Create a new user account with specified role and details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">First Name</Label>
                    <Input className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Last Name</Label>
                    <Input className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Email Address</Label>
                  <Input type="email" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: "admin" | "instructor" | "learner") => setNewUser({...newUser, role: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20 text-white">
                      <SelectItem value="learner">Learner</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                  <Button className="bg-white text-black hover:bg-gray-200" onClick={() => createUserMutation.mutate(newUser)} disabled={createUserMutation.isPending || !newUser.email}>
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent className="bg-black/60 backdrop-blur-xl border border-white/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Edit User</DialogTitle>
              </DialogHeader>
              {editingUser && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">First Name</Label>
                      <Input className="bg-white/10 border-white/20 text-white" value={editingUser.firstName || ''} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Last Name</Label>
                      <Input className="bg-white/10 border-white/20 text-white" value={editingUser.lastName || ''} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email Address</Label>
                    <Input className="bg-white/10 border-white/20 text-white" value={editingUser.email || ''} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Role</Label>
                    <Select value={editingUser.role} onValueChange={(value: "admin" | "instructor" | "learner") => setEditingUser({...editingUser, role: value})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20 text-white">
                        <SelectItem value="learner">Learner</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
                    <Button className="bg-white text-black hover:bg-gray-200" onClick={() => updateUserMutation.mutate(editingUser)} disabled={updateUserMutation.isPending}>
                      {updateUserMutation.isPending ? "Updating..." : "Update User"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">All Users</CardTitle>
                <CardDescription className="text-gray-300">Manage user accounts and roles</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                  <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20 text-white">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="learner">Learner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/70">User</TableHead>
                    <TableHead className="text-white/70">Role</TableHead>
                    <TableHead className="text-white/70">Email</TableHead>
                    <TableHead className="text-white/70">Joined</TableHead>
                    <TableHead className="text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'No name'}
                            </div>
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">ID: {user.id.substring(0,8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/80">
                        <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-white/40" />{user.email}</div>
                      </TableCell>
                      <TableCell className="text-white/60">
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-white/40" />{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-900/40" onClick={() => handleDeleteUser(user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}