import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { 
  Award, 
  Download, 
  Eye, 
  Calendar, 
  ExternalLink,
  Trophy,
  FileText
} from "lucide-react";
import { formatDate } from "date-fns";

interface Certificate {
  id: string;
  courseId: string;
  userId: string;
  issueDate: string;
  verificationCode: string;
  courseTitle?: string;
  userName?: string;
}

export default function CertificatesPage() {
  const { user, isAuthenticated } = useAuth();

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['/api/certificates'],
    enabled: isAuthenticated,
  });

  const downloadCertificate = async (certificateId: string, format: 'pdf' | 'html' = 'pdf') => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/download?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      if (format === 'html') {
        // Open in new tab for HTML
        const htmlContent = await response.text();
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();
        }
      } else {
        // Download PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const viewCertificate = (certificateId: string) => {
    downloadCertificate(certificateId, 'html');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Please log in to view your certificates.</p>
          <Button asChild>
            <a href="/api/login">Log In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Award className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
            <p className="text-gray-600 mt-1">
              Your achievements and completed course certifications
            </p>
          </div>
        </div>

        {certificates.length > 0 && (
          <div className="flex items-center gap-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Total Certificates: {certificates.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>All certificates are verifiable and shareable</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && certificates.length === 0 && (
        <EmptyState
          icon={<Award className="h-16 w-16 text-gray-400" />}
          title="No Certificates Yet"
          description="Complete courses to earn your first certificate and showcase your achievements!"
          actionHref="/courses"
          actionText="Browse Courses"
          size="lg"
        />
      )}

      {/* Certificates Grid */}
      {!isLoading && certificates.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate: Certificate) => (
            <Card key={certificate.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {certificate.courseTitle || 'Course Certificate'}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Earned
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Certificate Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Issued on {formatDate(new Date(certificate.issueDate), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Verification Code</p>
                    <p className="font-mono text-sm text-gray-800 break-all">
                      {certificate.verificationCode}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => viewCertificate(certificate.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    onClick={() => downloadCertificate(certificate.id, 'pdf')}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Section */}
      {certificates.length > 0 && (
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <ExternalLink className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Your Achievements</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your certificates are officially verified and can be shared with employers, added to your LinkedIn profile, 
                or included in your professional portfolio. Each certificate includes a unique verification code for authenticity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}