import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Download, Mail, Award, Calendar, User, BookOpen, Clock } from "lucide-react";
import { format } from "date-fns";

interface Certificate {
  id: string;
  type: 'session_completion' | 'course_completion';
  certificateNumber: string;
  title: string;
  description?: string;
  completionDate: string;
  totalDuration?: number;
  totalSessions?: number;
  instructorName: string;
  completedModules?: string;
  pdfUrl?: string;
  emailSent: boolean;
  emailSentAt?: string;
  verificationCode: string;
}

export default function CertificatesPage() {
  const { toast } = useToast();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['/api/certificates'],
    queryFn: () => apiRequest('GET', '/api/certificates').then(res => res.json())
  });

  const emailCertificateMutation = useMutation({
    mutationFn: (certificateId: string) => 
      apiRequest('POST', `/api/certificates/${certificateId}/email`),
    onSuccess: () => {
      toast({
        title: "Certificate Sent",
        description: "Your certificate has been sent to your email address."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send certificate email.",
        variant: "destructive"
      });
    }
  });

  const handleDownload = (certificate: Certificate) => {
    if (certificate.pdfUrl) {
      const link = document.createElement('a');
      link.href = certificate.pdfUrl;
      link.download = `certificate-${certificate.certificateNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEmailCertificate = (certificateId: string) => {
    emailCertificateMutation.mutate(certificateId);
  };

  const getCertificateTypeLabel = (type: string) => {
    return type === 'session_completion' ? 'Session Completion' : 'Course Completion';
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Award className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">
            View and manage your learning achievements
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete courses and sessions to earn certificates
            </p>
            <Button>
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {certificates.map((certificate: Certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={certificate.type === 'course_completion' ? 'default' : 'secondary'}>
                        {getCertificateTypeLabel(certificate.type)}
                      </Badge>
                      {certificate.emailSent && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Email Sent
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{certificate.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Completed {format(new Date(certificate.completionDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {certificate.instructorName}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmailCertificate(certificate.id)}
                      disabled={emailCertificateMutation.isPending}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(certificate)}
                      disabled={!certificate.pdfUrl}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Certificate Number
                      </h4>
                      <p className="font-mono text-sm">{certificate.certificateNumber}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Verification Code
                      </h4>
                      <p className="font-mono text-sm">{certificate.verificationCode}</p>
                    </div>
                  </div>

                  {certificate.type === 'course_completion' && (
                    <div className="space-y-4">
                      {certificate.totalSessions && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Sessions Completed
                          </h4>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span>{certificate.totalSessions} sessions</span>
                          </div>
                        </div>
                      )}
                      {certificate.totalDuration && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Total Duration
                          </h4>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{formatDuration(certificate.totalDuration)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {certificate.completedModules && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        Completed Modules
                      </h4>
                      <div className="space-y-1">
                        {JSON.parse(certificate.completedModules).slice(0, 3).map((module: string, index: number) => (
                          <div key={index} className="text-sm bg-secondary/50 px-2 py-1 rounded">
                            {module}
                          </div>
                        ))}
                        {JSON.parse(certificate.completedModules).length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{JSON.parse(certificate.completedModules).length - 3} more modules
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {certificate.description && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground">
                      {certificate.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}