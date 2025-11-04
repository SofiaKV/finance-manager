import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 disabled:pointer-events-none disabled:opacity-50 shadow-[0_2px_0_rgba(0,0,0,1),0_8px_18px_rgba(0,0,0,0.08)] active:translate-y-[1px] active:shadow-[0_1px_0_rgba(0,0,0,1),0_6px_12px_rgba(0,0,0,0.08)] relative overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-black text-white border border-black before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
        secondary:
          'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
        outline:
          'border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 shadow-none hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/5 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
        ghost: 'hover:bg-neutral-100 text-neutral-900 shadow-none',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 border border-red-700 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button };
// eslint-disable-next-line react-refresh/only-export-components
export { buttonVariants };
