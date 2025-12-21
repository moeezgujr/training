import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PublicLayout } from "@/components/layouts/public-layout";
import { useAuth } from "@/hooks/useAuth";
import { 
  HelpCircle, 
  MessageSquare, 
  SearchIcon, 
  BookOpen, 
  Settings, 
  CreditCard, 
  GraduationCap,
  CheckCircle
} from "lucide-react";

// Form schema
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(10, "Message should be at least 10 characters long"),
});

// FAQ data
const faqs = [
  {
    question: "How do I reset my password?",
    answer: "If you need to reset your password, click on the 'Forgot Password' link on the login page. Follow the instructions sent to your email to create a new password."
  },
  {
    question: "Can I download course content for offline viewing?",
    answer: "Currently, most course content is available for online streaming only. However, PDF resources and documents can be downloaded for offline use."
  },
  {
    question: "How do I receive my certificate after completing a course?",
    answer: "Certificates are automatically generated and issued when you complete all required modules and assessments of a course. You can access your certificates from the 'Certificates' section in your dashboard."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for course purchases. Payment information is securely processed through our payment gateway."
  },
  {
    question: "Can I get a refund if I'm not satisfied with a course?",
    answer: "Yes, we offer a 14-day satisfaction guarantee. If you're not satisfied with your purchase, you can request a refund within 14 days of enrollment, provided you have not completed more than 25% of the course."
  },
  {
    question: "How long do I have access to a course after purchase?",
    answer: "Once you purchase a course, you have lifetime access to the content, including any updates made to the course material over time."
  },
  {
    question: "Are the certificates accredited or recognized by professional organizations?",
    answer: "Our certificates verify course completion and are recognized by many organizations. For specific accreditation information, please check the individual course details or contact our support team."
  },
  {
    question: "What should I do if I encounter technical issues?",
    answer: "If you encounter technical issues, try refreshing your browser or clearing your cache first. If the problem persists, please contact our support team through the help form with details about the issue, including screenshots if possible."
  }
];

export default function SupportPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter FAQs based on search
  const filteredFaqs = faqs.filter((faq) => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Set up form with default values
  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
      email: user?.email || "",
      subject: "",
      category: "",
      message: "",
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof contactFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "Message sent",
        description: "We've received your message and will respond shortly.",
      });
      
      form.reset({
        name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
        email: user?.email || "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PublicLayout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">Help & Support</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get help with your account, courses, or any other questions you may have.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-background px-4">
                <HelpCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="faq" className="space-y-8">
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="faq" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>FAQs</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Us</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find quick answers to common questions about our platform.
                  </CardDescription>
                  <div className="relative mt-4">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search FAQs..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.length > 0 ? (
                      filteredFaqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground">
                              {faq.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">
                          No FAQs match your search. Try different keywords or contact us directly.
                        </p>
                      </div>
                    )}
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Can't find what you're looking for? Contact our support team for personalized help.
                  </p>
                </CardFooter>
              </Card>
              
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="flex flex-col items-center text-center p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Learning Resources</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Access tutorials, guides, and documentation to help you navigate the platform.
                  </p>
                  <Button variant="outline" className="mt-auto" asChild>
                    <a href="/resources">View Resources</a>
                  </Button>
                </Card>
                
                <Card className="flex flex-col items-center text-center p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Course Support</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Get help with course-specific questions from instructors and community.
                  </p>
                  <Button variant="outline" className="mt-auto" asChild>
                    <a href="/community">Visit Community</a>
                  </Button>
                </Card>
                
                <Card className="flex flex-col items-center text-center p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Technical Support</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Resolve technical issues with login, payments, or platform features.
                  </p>
                  <Button variant="outline" className="mt-auto" asChild>
                    <a href="/technical-support">Get Help</a>
                  </Button>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Our Support Team</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
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
                                <Input placeholder="Your email address" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Subject of your inquiry" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="account">Account Issues</SelectItem>
                                  <SelectItem value="billing">Billing & Payments</SelectItem>
                                  <SelectItem value="courses">Course Content</SelectItem>
                                  <SelectItem value="technical">Technical Problems</SelectItem>
                                  <SelectItem value="certificates">Certificates</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your issue or question in detail"
                                className="min-h-[150px] resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Please provide as much detail as possible so we can better assist you.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center border-t pt-6">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Typical response time: within 24 hours</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Our support team is available Monday through Friday, 9am to 5pm EST.
                  </p>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Alternative Contact Methods</CardTitle>
                  <CardDescription>
                    Other ways to reach our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Send us an email directly at:
                    </p>
                    <a href="mailto:support@meetingmatters.edu" className="text-primary hover:underline">
                      support@meetingmatters.edu
                    </a>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Phone Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Call our support line during business hours:
                    </p>
                    <a href="tel:+18005551234" className="text-primary hover:underline">
                      +1 (800) 555-1234
                    </a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PublicLayout>
  );
}