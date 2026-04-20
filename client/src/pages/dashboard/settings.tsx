import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Redirect } from "@/components/ui/redirect";
import { Shield, User, BookOpen, CircleHelp, UserCog, Settings, Bell, Lock } from "lucide-react";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | undefined>(user?.role);
  
  // Loading state
  if (isLoading) {
    return <div className="container py-8">Loading...</div>;
  }
  
  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Redirect to="/api/login" />;
  }
  
  const updateUserRole = async (newRole: string) => {
    if (!user || !newRole || isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      // Make API request to update role
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update role");
      }
      
      // Show success message
      toast({
        title: "Role Updated",
        description: `Your role has been updated to ${newRole}.`,
        variant: "default",
      });
      
      // Update the user in the cache
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Force page reload to refresh authentication status
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // For development purposes - direct role change
  const handleDeveloperRoleChange = async () => {
    if (!selectedRole || selectedRole === user?.role) return;
    await updateUserRole(selectedRole);
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Account Settings</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="developer" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span>Developer</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View and update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : "Not provided"}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email || "Not provided"}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Role</p>
                  <Badge>{user?.role || "learner"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Notification settings will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="developer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Developer Settings</CardTitle>
              <CardDescription>
                These settings are for development purposes only
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Change Your Role (Development Only)</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  This option allows you to change your role for testing purposes. In a production environment, 
                  this would be managed by administrators.
                </p>
                
                <div className="flex gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm">Select Role</label>
                    <Select
                      value={selectedRole}
                      onValueChange={setSelectedRole}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="learner">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Learner</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="instructor">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>Instructor</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>Administrator</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="outline"
                    disabled={!selectedRole || selectedRole === user?.role || isUpdating}
                    onClick={handleDeveloperRoleChange}
                  >
                    {isUpdating ? "Updating..." : "Update Role"}
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="rounded-md border p-4 bg-amber-500/10 text-amber-700">
                <div className="flex gap-2 items-start">
                  <CircleHelp className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Developer Information</h4>
                    <p className="text-sm">
                      To access the different dashboards based on your role:
                    </p>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Instructor Dashboard: <code className="bg-muted px-1 py-0.5 rounded">/instructor</code></li>
                      <li>• Admin Dashboard: <code className="bg-muted px-1 py-0.5 rounded">/admin</code></li>
                      <li>• Learner Dashboard: <code className="bg-muted px-1 py-0.5 rounded">/dashboard</code></li>
                    </ul>
                    <p className="text-sm mt-2">
                      After changing your role, you may need to refresh the page or log out and log back in.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}