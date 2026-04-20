import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
  {
    variants: {
      variant: {
        // Futuristic Primary: Gradient with a subtle outer glow
        default: 
          "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] hover:brightness-110",
        
        // Neon Glass: Semi-transparent with border glow
        neon:
          "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 backdrop-blur-md hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]",
        
        // Destructive: Deep red pulse
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-[0_0_20px_rgba(225,29,72,0.4)]",
        
        // Outline: Sleek glass border
        outline:
          "border border-white/10 bg-white/5 backdrop-blur-sm text-slate-200 hover:bg-white/10 hover:text-white hover:border-white/20",
        
        // Shimmer: For "Get Started" buttons (needs the relative/overflow-hidden)
        shine:
          "relative overflow-hidden bg-slate-900 text-white before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent border border-white/10",
        
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700 shadow-inner",
        
        ghost: "hover:bg-white/5 hover:text-cyan-400",
        
        link: "text-cyan-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-2xl px-10 text-base tracking-wide",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }