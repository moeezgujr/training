import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Users,
  BookOpen,
  Award,
  GraduationCap,
  Brain,
  Lightbulb,
  ArrowRight
} from "lucide-react";

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 relative bg-muted/30 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/95"></div>
          <div className="absolute left-1/3 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute right-1/3 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Meeting Matters LMS</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Transforming mental health education through evidence-based learning
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-primary/20 rounded-full bg-primary/5 text-primary text-sm font-medium">
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pioneering Excellence in <span className="text-primary">Mental Health Education</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Founded in 2018, Meeting Matters LMS emerged from a recognition of the growing need for specialized education in mental health practices. Our founders, a team of experienced mental health professionals and educators, identified a significant gap in the availability of comprehensive, evidence-based training resources.
              </p>
              <p className="text-muted-foreground mb-6">
                We set out to create a platform that would not only provide accessible learning opportunities for mental health practitioners but also maintain the highest standards of clinical excellence and evidence-based practice. Our focus on anxiety and depression treatment stemmed from the prevalence of these conditions and the need for specialized training in effective interventions.
              </p>
              <p className="text-muted-foreground">
                Today, Meeting Matters LMS serves thousands of professionals worldwide, offering cutting-edge courses that blend theoretical knowledge with practical applications, helping practitioners deliver more effective care to their clients.
              </p>
            </div>
            <div className="relative">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                  alt="Team of professionals" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-primary/10 -z-10"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-secondary/10 -z-10"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Mission Section */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-secondary/20 rounded-full bg-secondary/5 text-secondary text-sm font-medium">
              Our Mission
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Empowering Mental Health Professionals Through <span className="text-secondary">Knowledge</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We're committed to advancing mental health education and improving client outcomes through comprehensive, accessible, and evidence-based learning resources.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all hover:border-secondary/20">
              <div className="bg-secondary/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Brain className="text-secondary h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Evidence-Based Practice</h3>
              <p className="text-muted-foreground">
                We rigorously develop our curriculum based on the latest research and clinical guidelines, ensuring practitioners have access to the most effective treatment approaches.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all hover:border-secondary/20">
              <div className="bg-secondary/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Users className="text-secondary h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Accessible Education</h3>
              <p className="text-muted-foreground">
                We strive to make specialized training accessible to all mental health professionals, regardless of location or resources, through our flexible learning platform.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all hover:border-secondary/20">
              <div className="bg-secondary/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="text-secondary h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Innovative Learning</h3>
              <p className="text-muted-foreground">
                We continuously innovate our teaching methods and course delivery to maximize engagement, retention, and practical application of knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Team Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-primary/20 rounded-full bg-primary/5 text-primary text-sm font-medium">
              Our Team
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Led by Experts in Mental Health and Education
            </h2>
            <p className="text-lg text-muted-foreground">
              Our diverse team combines expertise in clinical practice, research, and education to create exceptional learning experiences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-background rounded-xl overflow-hidden border border-border hover:shadow-md transition-all group">
              <div className="aspect-square overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80" 
                  alt="Dr. Robert Chen" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-1">Dr. Robert Chen</h3>
                <p className="text-primary text-sm mb-3">Founder & CEO</p>
                <p className="text-muted-foreground text-sm">
                  Clinical Psychologist with over 20 years of experience in depression and anxiety treatment.
                </p>
              </div>
            </div>
            
            <div className="bg-background rounded-xl overflow-hidden border border-border hover:shadow-md transition-all group">
              <div className="aspect-square overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=988&q=80" 
                  alt="Dr. Sarah Williams" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-1">Dr. Sarah Williams</h3>
                <p className="text-primary text-sm mb-3">Chief Academic Officer</p>
                <p className="text-muted-foreground text-sm">
                  Psychiatrist specializing in cognitive behavioral therapy and educational design.
                </p>
              </div>
            </div>
            
            <div className="bg-background rounded-xl overflow-hidden border border-border hover:shadow-md transition-all group">
              <div className="aspect-square overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1484863137850-59afcfe05386?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                  alt="Jennifer Miller" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-1">Jennifer Miller</h3>
                <p className="text-primary text-sm mb-3">Content Director</p>
                <p className="text-muted-foreground text-sm">
                  Specializing in creating engaging learning experiences for mental health education.
                </p>
              </div>
            </div>
            
            <div className="bg-background rounded-xl overflow-hidden border border-border hover:shadow-md transition-all group">
              <div className="aspect-square overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1578496480157-697fc14d2e55?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                  alt="Dr. Michael Thompson" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-1">Dr. Michael Thompson</h3>
                <p className="text-primary text-sm mb-3">Research Director</p>
                <p className="text-muted-foreground text-sm">
                  Leading our research initiatives to ensure our courses reflect the latest evidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Impact Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-accent/20 rounded-full bg-accent/5 text-accent text-sm font-medium">
              Our Impact
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Making a Difference in Mental Health Care
            </h2>
            <p className="text-lg text-muted-foreground">
              Our education platform has helped thousands of professionals enhance their practice and improve client outcomes.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">15,000+</div>
              <p className="text-muted-foreground">Active Professionals</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">50+</div>
              <p className="text-muted-foreground">Specialized Courses</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">92%</div>
              <p className="text-muted-foreground">Satisfaction Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">30+</div>
              <p className="text-muted-foreground">Countries Reached</p>
            </div>
          </div>
          
          <div className="bg-background rounded-xl p-8 border border-border shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-4">Ready to Enhance Your Practice?</h3>
                <p className="text-muted-foreground mb-6 max-w-lg">
                  Join our community of mental health professionals and access our specialized courses in depression and anxiety treatment.
                </p>
                <Button size="lg" asChild>
                  <Link href="/courses">
                    Explore Our Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Research-Based</h4>
                    <p className="text-sm text-muted-foreground">Evidence-backed methods</p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-4">
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <GraduationCap className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Expert-Led</h4>
                    <p className="text-sm text-muted-foreground">Taught by practitioners</p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-4">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Brain className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium">Specialized Focus</h4>
                    <p className="text-sm text-muted-foreground">Anxiety & depression</p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Certified</h4>
                    <p className="text-sm text-muted-foreground">Professional recognition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}