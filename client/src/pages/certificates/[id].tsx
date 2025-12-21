import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "@/components/ui/redirect";
import { formatDate } from "@/lib/utils";
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  FileText,
  Calendar,
  Certificate,
  BookOpen,
  ChevronLeft,
  Shield,
  Check
} from "lucide-react";

export default function CertificateDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthLoading && !isAuthenticated) {
    return <Redirect to="/api/login" />;
  }
  
  // Fetch certificate data
  const { data: certificate, isLoading: isCertificateLoading } = useQuery({
    queryKey: ["/api/certificates", id],
    enabled: isAuthenticated && !!id,
  });
  
  // Handle download
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      const response = await fetch(`/api/certificates/${id}/download`);
      
      if (!response.ok) {
        throw new Error("Failed to download certificate");
      }
      
      // Get blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your certificate is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Handle share (copy link)
  const handleShare = () => {
    try {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      
      toast({
        title: "Link copied",
        description: "Certificate link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Failed to copy link. Please try manually.",
        variant: "destructive",
      });
    }
  };
  
  // Loading state
  if (isCertificateLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-[400px] w-full" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-20 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  // Error state - certificate not found
  if (!certificate) {
    return (
      <div className="container py-8">
        <EmptyState
          icon={<Certificate className="h-10 w-10" />}
          title="Certificate Not Found"
          description="The certificate you're looking for doesn't exist or you don't have access to it."
          actionHref="/certificates"
          actionText="View All Certificates"
        />
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/certificates">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Certificates
            </Link>
          </Button>
          
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Verified</span>
            <Check className="h-3.5 w-3.5 text-green-600 ml-1" />
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Certificate of Completion</h1>
          <p className="text-muted-foreground">
            This certificate verifies your successful completion of the course.
          </p>
        </div>
        
        <Card className="overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-t-lg"></div>
            <div className="p-8 relative">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-10 w-10 text-primary" />
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold mb-1">Certificate of Completion</h2>
                <p className="text-muted-foreground">This certifies that</p>
                <p className="text-2xl font-semibold mt-4 mb-4">{certificate.userName}</p>
                <p className="text-muted-foreground">has successfully completed the course</p>
                <p className="text-xl font-semibold mt-4 mb-4">{certificate.courseTitle}</p>
                <div className="flex items-center justify-center mt-8 mb-4">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Issued on {formatDate(certificate.issueDate)}</span>
                </div>
                <div className="mt-6 text-xs text-muted-foreground">
                  Verification Code: {certificate.verificationCode}
                </div>
              </div>
            </div>
          </div>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between p-6 bg-muted/30">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button 
                variant="default" 
                className="w-full sm:w-auto"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Downloading..." : "Download PDF"}
              </Button>
            </div>
            
            <Link href={`/courses/${certificate.courseId}`}>
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                <BookOpen className="h-4 w-4 mr-2" />
                View Course
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Certificate Information</CardTitle>
            <CardDescription>
              Details and verification information for this certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Certificate ID</dt>
                <dd className="mt-1 text-sm">{certificate.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Issue Date</dt>
                <dd className="mt-1 text-sm">{formatDate(certificate.issueDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Course</dt>
                <dd className="mt-1 text-sm">{certificate.courseTitle}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Recipient</dt>
                <dd className="mt-1 text-sm">{certificate.userName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Verification Code</dt>
                <dd className="mt-1 text-sm font-mono">{certificate.verificationCode}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1 text-sm flex items-center">
                  <span className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    Valid
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Verify This Certificate</CardTitle>
            <CardDescription>
              Anyone can verify the authenticity of this certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              To verify this certificate, share this page URL or verification code with the person who needs to verify your credential.
            </p>
            <div className="bg-muted p-4 rounded-md">
              <div className="font-mono text-xs break-all">
                {window.location.origin}/certificates/verify/{certificate.verificationCode}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              This certificate is issued by Meeting Matters LMS and represents completion of the specified course.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}