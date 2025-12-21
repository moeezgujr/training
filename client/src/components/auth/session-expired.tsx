import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LogIn } from "lucide-react";

export function SessionExpired() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle>Session Expired</CardTitle>
          <CardDescription>
            Your login session has expired. Please sign in again to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} className="w-full flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Sign In Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}