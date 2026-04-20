import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicLayout } from "@/components/layouts/public-layout";
import { CheckCircle, Mail, ArrowRight, BookOpen, Users, Award } from "lucide-react";

export default function RegistrationSuccess() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full animate-pulse">
                <CheckCircle className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Meeting Matters!
            </h1>
            <p className="text-xl text-gray-600">
              Your registration was successful
            </p>
          </div>

          {/* Success Card */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-700">Registration Complete</CardTitle>
              <CardDescription className="text-lg">
                Thank you for joining our learning community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Verification Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Check Your Email</h3>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      We've sent a verification email to your registered email address. 
                      Please click the verification link to activate your account and start learning.
                    </p>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">What's Next?</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">1. Verify Your Email</h4>
                      <p className="text-sm text-gray-600">Check your inbox and click the verification link</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">2. Explore Courses</h4>
                      <p className="text-sm text-gray-600">Browse our extensive course catalog</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">3. Join the Community</h4>
                      <p className="text-sm text-gray-600">Connect with fellow learners and instructors</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Award className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">4. Start Learning</h4>
                      <p className="text-sm text-gray-600">Begin your educational journey and earn certificates</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/courses" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Explore Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/api/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Free Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Access to introductory courses</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Learning progress tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Community forum access</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Monthly newsletter</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/contact" className="text-blue-600 hover:underline">
                      Contact Support
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-blue-600 hover:underline">
                      Frequently Asked Questions
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="text-blue-600 hover:underline">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/getting-started" className="text-blue-600 hover:underline">
                      Getting Started Guide
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="text-center mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-lg">
            <p className="text-gray-600">
              Didn't receive the verification email?{" "}
              <button className="text-blue-600 hover:underline font-medium">
                Resend verification email
              </button>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              For immediate assistance, contact us at{" "}
              <a href="mailto:support@meetingmatters.com" className="text-blue-600 hover:underline">
                support@meetingmatters.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}