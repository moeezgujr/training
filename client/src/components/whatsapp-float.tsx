import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openWhatsApp = () => {
    const phoneNumber = "923311479800";
    const message = encodeURIComponent("Hello! I need help with Meeting Matters LMS. Could you please assist me?");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <Card className="mb-4 w-80 shadow-lg border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Meeting Matters Support</h4>
                    <p className="text-xs text-muted-foreground">Typically replies in minutes</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-green-800">
                  👋 Hi there! Need help with your psychology courses or have any questions? 
                  I'm here to assist you!
                </p>
              </div>
              
              <Button 
                onClick={openWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Start WhatsApp Chat
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                Monday-Friday, 8AM-8PM PST
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Main floating button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
          style={{
            background: isOpen ? '#dc2626' : '#16a34a',
          }}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </Button>
        
        {/* Online indicator */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
        )}
      </div>
    </>
  );
}