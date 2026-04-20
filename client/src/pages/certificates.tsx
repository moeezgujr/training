import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Download, Award, Calendar, User, BookOpen, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

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
  verificationCode: string;
}

export default function CertificatesPage() {
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['/api/certificates'],
    queryFn: () => apiRequest('GET', '/api/certificates').then(res => res.json())
  });

  const handleDownload = async (certificate: Certificate) => {
    try {
      const response = await fetch(`/api/certificates/${certificate.id}/download`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificate.certificateNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
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
      <div className="container mx-auto py-12 bg-transparent min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 space-y-10 bg-transparent min-h-screen relative z-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-[1.5rem] bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center backdrop-blur-xl">
            <Award className="h-10 w-10 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">My Credentials</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
              Verified Learning Achievements
            </p>
          </div>
        </div>
      </div>

      {certificates.length === 0 ? (
        <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[3rem] border-dashed border-2">
          <CardContent className="text-center py-24">
            <div className="h-24 w-24 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Award className="h-12 w-12 text-white/20" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">NO CERTIFICATES EARNED YET</h3>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto font-medium">
              Complete your active modules to unlock professional certifications.
            </p>
            <Button asChild className="bg-white text-black hover:bg-cyan-400 font-black rounded-full px-8 h-12 transition-all">
              <Link href="/courses">BROWSE COURSES</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {certificates.map((certificate: Certificate) => (
            <Card key={certificate.id} className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl group hover:bg-white/10 transition-all duration-500">
              <CardHeader className="p-8 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-cyan-500 text-black font-black px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">
                        {getCertificateTypeLabel(certificate.type)}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl font-black text-white tracking-tight leading-none group-hover:text-cyan-400 transition-colors">
                      {certificate.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-cyan-500" />
                        {format(new Date(certificate.completionDate), 'MMMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-cyan-500" />
                        {certificate.instructorName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Button
                      className="bg-white text-black hover:bg-cyan-400 font-black rounded-full px-10 h-14 transition-all shadow-xl shadow-black/40 group/btn"
                      onClick={() => handleDownload(certificate)}
                    >
                      <Download className="h-5 w-5 mr-3 group-hover/btn:translate-y-0.5 transition-transform" />
                      DOWNLOAD PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-6 p-6 rounded-3xl bg-black/30 border border-white/5 backdrop-blur-md">
                    <div>
                      <h4 className="font-black text-[10px] text-cyan-400 uppercase tracking-widest mb-2">
                        Registry Number
                      </h4>
                      <p className="font-mono text-sm text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 w-fit">
                        {certificate.certificateNumber}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-black text-[10px] text-cyan-400 uppercase tracking-widest mb-2">
                        Verification Code
                      </h4>
                      <p className="font-mono text-sm text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 w-fit">
                        {certificate.verificationCode}
                      </p>
                    </div>
                  </div>

                  {certificate.type === 'course_completion' && (
                    <div className="space-y-6">
                      {certificate.totalSessions && (
                        <div>
                          <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-3">
                            Curriculum Load
                          </h4>
                          <div className="flex items-center gap-3 text-white">
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                               <BookOpen className="h-5 w-5 text-cyan-500" />
                            </div>
                            <span className="font-black text-xl tracking-tighter">{certificate.totalSessions} Sessions</span>
                          </div>
                        </div>
                      )}
                      {certificate.totalDuration && (
                        <div>
                          <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-3">
                            Time Investment
                          </h4>
                          <div className="flex items-center gap-3 text-white">
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                               <Clock className="h-5 w-5 text-cyan-500" />
                            </div>
                            <span className="font-black text-xl tracking-tighter">{formatDuration(certificate.totalDuration)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {certificate.completedModules && (
                    <div>
                      <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4">
                        Major Competencies
                      </h4>
                      <div className="space-y-2">
                        {JSON.parse(certificate.completedModules).slice(0, 3).map((module: string, index: number) => (
                          <div key={index} className="text-[11px] font-bold text-slate-300 bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center hover:bg-white/10 transition-colors">
                            <ChevronRight className="h-3 w-3 mr-2 text-cyan-500" />
                            {module}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {certificate.description && (
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <p className="text-sm text-slate-400 leading-relaxed italic opacity-80">
                      &ldquo;{certificate.description}&rdquo;
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}