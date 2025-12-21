import { Button } from "@/components/ui/button";

interface HelpFloatProps {
  onClick?: () => void;
}

export function HelpFloat({ onClick }: HelpFloatProps) {

  return (
    <div className="fixed bottom-32 right-6 z-40">
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Help float button clicked!');
          if (onClick) {
            onClick();
          }
        }}
        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 group"
        title="Take a quick tour of the platform"
        type="button"
      >
        <svg 
          className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <path d="M12 17h.01"></path>
        </svg>
      </Button>
      
      {/* Floating label */}
      <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Need help? Take a quick tour!
        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
      </div>
    </div>
  );
}