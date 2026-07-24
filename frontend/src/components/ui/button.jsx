import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "src/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-[var(--neon-accent)] to-[#1A5CFF] text-white hover:brightness-125 border-t border-white/20 hover:shadow-[0_0_15px_rgba(45,124,255,0.6)] neon-glow-accent",
        destructive:
          "bg-gradient-to-b from-[var(--neon-loss)] to-[#CC0033] text-white hover:brightness-125 border-t border-white/20 hover:shadow-[0_0_15px_rgba(255,45,85,0.6)] neon-glow-loss",
        outline:
          "border border-[var(--border-visible)] bg-[var(--surface-glass)] hover:bg-[var(--surface-hover)] text-white hover:border-[var(--neon-accent)] hover:shadow-[0_0_10px_rgba(45,124,255,0.2)]",
        secondary:
          "bg-[var(--surface-raised)] text-white hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-visible)]",
        ghost: "hover:bg-[var(--surface-hover)] hover:text-white text-[var(--text-secondary)]",
        link: "text-[var(--neon-accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
