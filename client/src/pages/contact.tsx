import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  CheckCircle,
  Send,
  ExternalLink
} from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject is too short"),
  message: z.string().min(10, "Please provide more detail"),
  department: z.string().min(1, "Select a department"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", department: "" },
  });

  function onSubmit(data: ContactFormValues) {
    console.log("Form Data:", data);
    setFormSubmitted(true);
    form.reset();
  }

  const openWhatsApp = () => {
    const phoneNumber = "923311479800";
    const text = encodeURIComponent("Hello Meeting Matters team! I have an inquiry regarding...");
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20">
      {/* Hero Header */}
      <div className="relative py-20 px-6 lg:px-12 border-b border-slate-800/50 bg-gradient-to-b from-slate-900/20 to-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent mb-6">
            Get in Touch
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Have questions about our elite psychology curriculum? Our support team is ready to assist you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16">
        <div className="grid lg:grid-cols-5 gap-12">
          
          {/* Contact Information (Left Column) */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Direct Channels</h2>
              <div className="space-y-4">
                <a href="mailto:support@meetingmatters.com" className="group flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/50 transition-all">
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Email Us</p>
                    <p className="text-slate-200 font-medium">support@meetingmatters.com</p>
                  </div>
                </a>

                <a href="tel:+18005551212" className="group flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/50 transition-all">
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Call Center</p>
                    <p className="text-slate-200 font-medium">+1 (800) 555-1212</p>
                  </div>
                </a>

                <button onClick={openWhatsApp} className="w-full group flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-green-500/50 transition-all text-left">
                  <div className="p-3 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Live Chat</p>
                    <p className="text-slate-200 font-medium">WhatsApp Business</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-600 mr-2" />
                </button>
              </div>
            </div>

            <Card className="p-6 bg-cyan-950/20 border-cyan-900/30">
              <h3 className="text-cyan-400 font-semibold mb-2">Student Support Hours</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our advisors are available Monday through Friday, 9:00 AM — 6:00 PM EST. 
                Inquiries sent over the weekend will be prioritized on Monday morning.
              </p>
            </Card>
          </div>

          {/* Contact Form (Right Column) */}
          <div className="lg:col-span-3">
            <Card className="p-8 bg-slate-900/40 border-slate-800 backdrop-blur-md">
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
                    <CheckCircle className="h-10 w-10 text-cyan-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Inquiry Received</h2>
                  <p className="text-slate-400 mb-8 max-w-sm">
                    Thank you for reaching out. A specialist from our team will contact you shortly.
                  </p>
                  <Button variant="outline" className="border-slate-700 hover:bg-slate-800" onClick={() => setFormSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="bg-slate-950 border-slate-800 text-white focus:border-cyan-500 transition-colors" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )} />
                      
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" className="bg-slate-950 border-slate-800 text-white focus:border-cyan-500 transition-colors" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                              <SelectValue placeholder="Where should we direct your inquiry?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="billing">Billing & Payments</SelectItem>
                            <SelectItem value="courses">Course Information</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="subject" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="How can we help?" className="bg-slate-950 border-slate-800 text-white focus:border-cyan-500 transition-colors" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Detailed Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide as much detail as possible..." 
                            className="min-h-[150px] bg-slate-950 border-slate-800 text-white focus:border-cyan-500 transition-colors" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )} />

                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-6 text-lg font-semibold transition-all">
                      <Send className="mr-2 h-5 w-5" /> Send Message
                    </Button>
                  </form>
                </Form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}