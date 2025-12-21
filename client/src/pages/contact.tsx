
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  HelpCircle, 
  FileText, 
  Award,
  CheckCircle
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  department: z.string({
    required_error: "Please select a department.",
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const defaultValues: Partial<ContactFormValues> = {
  name: "",
  email: "",
  subject: "",
  message: "",
  department: "",
};

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

  function onSubmit(data: ContactFormValues) {
    console.log(data);
    // In a real application, we would send this data to a backend API
    setFormSubmitted(true);
    form.reset();
  }

  return (
    <div>
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions about our courses or need assistance? Our team is here to help. Reach out through any of our support channels below.
            </p>
          </div>
          
          <Tabs defaultValue="contact-form" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="contact-form">Contact Form</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contact-form">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Card className="p-6">
                    {formSubmitted ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Message Sent!</h2>
                        <p className="text-muted-foreground text-center mb-6">
                          Thank you for reaching out. We'll get back to you as soon as possible.
                        </p>
                        <Button variant="outline" onClick={() => setFormSubmitted(false)}>
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your full name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your email address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="general">General Inquiry</SelectItem>
                                    <SelectItem value="technical">Technical Support</SelectItem>
                                    <SelectItem value="billing">Billing & Payments</SelectItem>
                                    <SelectItem value="courses">Course Information</SelectItem>
                                    <SelectItem value="certification">Certification</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                  <Input placeholder="Subject of your message" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Please describe your inquiry in detail" 
                                    className="min-h-[120px]" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button type="submit" size="lg">
                              Send Message
                            </Button>
                          </div>
                        </form>
                      </Form>
                    )}
                  </Card>
                </div>
                
                <div>
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Email Us</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            We'll respond within 24-48 hours
                          </p>
                          <a href="mailto:support@meetingmatters.com" className="text-sm font-medium text-primary">
                            support@meetingmatters.com
                          </a>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Call Us</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Monday-Friday, 9AM-5PM PST
                          </p>
                          <a href="tel:+18005551212" className="text-sm font-medium text-primary">
                            +1 (800) 555-1212
                          </a>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Office Location</h3>
                          <p className="text-sm text-muted-foreground">
                            123 Learning Avenue<br />
                            Suite 456<br />
                            Education City, CA 90000
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="support">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Live Chat Support</h3>
                      <p className="text-muted-foreground mb-4">
                        Connect with our support team instantly through our live chat feature available on the learning platform.
                      </p>
                      <div className="text-sm">
                        <p><span className="font-medium">Hours:</span> Monday-Friday, 8AM-8PM PST</p>
                        <p><span className="font-medium">Response Time:</span> Typically within minutes</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                    onClick={() => {
                      const phoneNumber = "923311479800"; // WhatsApp Business number
                      const message = encodeURIComponent("Hello! I need help with Meeting Matters LMS. Could you please assist me?");
                      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat on WhatsApp
                  </Button>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <HelpCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Knowledge Base</h3>
                      <p className="text-muted-foreground mb-4">
                        Browse our comprehensive help center with articles, tutorials, and guides to common questions and platform features.
                      </p>
                      <div className="text-sm">
                        <p><span className="font-medium">Topics:</span> Account management, course navigation, technical troubleshooting, certification process</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Visit Help Center
                  </Button>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Submit a Support Ticket</h3>
                      <p className="text-muted-foreground mb-4">
                        For complex issues or detailed inquiries, submit a support ticket for personalized assistance from our team.
                      </p>
                      <div className="text-sm">
                        <p><span className="font-medium">Response Time:</span> Within 24-48 hours</p>
                        <p><span className="font-medium">Ticket Tracking:</span> Monitor progress through your account dashboard</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Submit a Ticket
                  </Button>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Certification Support</h3>
                      <p className="text-muted-foreground mb-4">
                        Need assistance with your course certificates or have questions about continuing education credits?
                      </p>
                      <div className="text-sm">
                        <p><span className="font-medium">Email:</span> certificates@meetingmatters.com</p>
                        <p><span className="font-medium">Phone:</span> +1 (800) 555-1213</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Certificate Verification
                  </Button>
                </Card>
              </div>
              
              <Alert className="mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  Our support team is committed to assisting mental health professionals. For urgent clinical matters related to clients, please contact appropriate emergency services or professional supervision resources.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="faq">
              <div className="space-y-6 max-w-3xl mx-auto">
                <Card className="p-6">
                  <h3 className="text-xl font-medium mb-4">Frequently Asked Questions</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-primary mb-2">How do I access my purchased courses?</h4>
                      <p className="text-muted-foreground">
                        After logging in, navigate to your dashboard where you'll find all your enrolled courses. Click on any course to begin or continue your learning journey. Your progress is automatically saved.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-primary mb-2">What are the system requirements for accessing the platform?</h4>
                      <p className="text-muted-foreground">
                        Our platform is accessible on any modern web browser (Chrome, Firefox, Safari, Edge). For optimal experience, we recommend a stable internet connection and updated browser. Mobile apps are available for iOS and Android devices.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-primary mb-2">How do I receive my certificate after completing a course?</h4>
                      <p className="text-muted-foreground">
                        Certificates are automatically generated once you've completed all required modules, quizzes, and assignments. You can access and download your certificates from the "Certificates" section of your dashboard.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-primary mb-2">Can I get continuing education credits for these courses?</h4>
                      <p className="text-muted-foreground">
                        Many of our courses are eligible for continuing education credits. Each course description specifies credit eligibility. After course completion, your certificate will indicate the applicable CE credits earned.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-primary mb-2">What is your refund policy?</h4>
                      <p className="text-muted-foreground">
                        We offer a 14-day money-back guarantee for courses if you've accessed less than 30% of the content. For subscription plans, cancellations are processed at the end of the current billing cycle. Please contact our support team for refund requests.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-primary mb-2">How long do I have access to a course after purchase?</h4>
                      <p className="text-muted-foreground">
                        Standard course purchases include lifetime access to the course materials. Subscription plans provide access for the duration of your active subscription. Course updates and improvements are included at no additional cost.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t">
                    <p className="text-muted-foreground text-center">
                      Don't see your question here? Contact our support team for assistance.
                    </p>
                    <div className="flex justify-center mt-4">
                      <Button>View More FAQs</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}