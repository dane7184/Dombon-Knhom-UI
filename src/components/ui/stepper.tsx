"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { Slot } from "@radix-ui/react-slot"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// --- Context & Types ---

type StepperContextValue = {
    value: number
    onValueChange: (value: number) => void
    orientation: "horizontal" | "vertical"
}

const StepperContext = React.createContext<StepperContextValue | undefined>(
    undefined
)

function useStepper() {
    const context = React.useContext(StepperContext)
    if (!context) {
        throw new Error("useStepper must be used within a Stepper")
    }
    return context
}

type StepperItemContextValue = {
    step: number
    state: "completed" | "active" | "inactive" | "error"
}

const StepperItemContext = React.createContext<
    StepperItemContextValue | undefined
>(undefined)

function useStepperItem() {
    const context = React.useContext(StepperItemContext)
    if (!context) {
        throw new Error("useStepperItem must be used within a StepperItem")
    }
    return context
}

// --- Components ---

const Stepper = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value: number
        onValueChange: (value: number) => void
        orientation?: "horizontal" | "vertical"
    }
>(({ className, value, onValueChange, orientation = "horizontal", ...props }, ref) => {
    return (
        <StepperContext.Provider value={{ value, onValueChange, orientation }}>
            <div
                ref={ref}
                className={cn(
                    "flex",
                    orientation === "horizontal" ? "flex-col gap-4" : "flex-row gap-8",
                    className
                )}
                {...props}
            />
        </StepperContext.Provider>
    )
})
Stepper.displayName = "Stepper"

const StepperNav = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { orientation } = useStepper()
    return (
        <div
            ref={ref}
            className={cn(
                "flex",
                orientation === "horizontal" ? "flex-row items-center" : "flex-col",
                className
            )}
            {...props}
        />
    )
})
StepperNav.displayName = "StepperNav"

const StepperItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        step: number
        error?: boolean
    }
>(({ className, step, error, ...props }, ref) => {
    const { value, orientation } = useStepper()

    const state = error
        ? "error"
        : value > step
            ? "completed"
            : value === step
                ? "active"
                : "inactive"

    return (
        <StepperItemContext.Provider value={{ step, state }}>
            <div
                ref={ref}
                className={cn(
                    "group flex shrink-0 items-center gap-2",
                    orientation === "horizontal" ? "flex-row" : "flex-col items-start",
                    className
                )}
                data-state={state}
                {...props}
            />
        </StepperItemContext.Provider>
    )
})
StepperItem.displayName = "StepperItem"

const StepperTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
    const { onValueChange } = useStepper()
    const { step, state } = useStepperItem()
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            ref={ref}
            className={cn(
                "flex items-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                asChild ? "" : "rounded-md px-2 py-1 hover:bg-accent hover:text-accent-foreground",
                className
            )}
            onClick={() => onValueChange(step)}
            data-state={state}
            {...props}
        />
    )
})
StepperTrigger.displayName = "StepperTrigger"

const StepperIndicator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, children, ...props }, ref) => {
    const { state } = useStepperItem()
    const Comp = asChild ? Slot : "div"

    if (asChild) {
        return (
            <Comp ref={ref} className={className} data-state={state} {...props}>
                {children}
            </Comp>
        )
    }

    return (
        <div
            ref={ref}
            className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 font-medium transition-colors",
                state === "active" && "border-primary bg-primary text-primary-foreground",
                state === "completed" && "border-primary bg-primary text-primary-foreground",
                state === "inactive" && "border-primary bg-primary text-primary-foreground",
                state === "error" && "border-destructive bg-destructive text-destructive-foreground",
                className
            )}
            data-state={state}
            {...props}
        >
            {state === "completed" ? (
                <CheckIcon className="h-4 w-4" />
            ) : state === "error" ? (
                <XIcon className="h-4 w-4" />
            ) : (
                children
            )}
        </div>
    )
})
StepperIndicator.displayName = "StepperIndicator"

const StepperSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { orientation } = useStepper()
    const { state } = useStepperItem()

    return (
        <div
            ref={ref}
            className={cn(
                "bg-muted transition-colors",
                orientation === "horizontal" ? "h-0.5 w-full flex-1" : "h-full w-0.5 min-h-4 flex-1",
                state === "completed" && "bg-primary",
                state === "inactive" && "bg-primary",
                className
            )}
            data-state={state}
            {...props}
        />
    )
})
StepperSeparator.displayName = "StepperSeparator"

const StepperPanel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props} />
    )
})
StepperPanel.displayName = "StepperPanel"

const StepperContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: number }
>(({ className, value: stepValue, ...props }, ref) => {
    const { value } = useStepper()

    if (value !== stepValue) return null

    return (
        <div
            ref={ref}
            className={cn("animate-in fade-in-0 zoom-in-95", className)}
            {...props}
        />
    )
})
StepperContent.displayName = "StepperContent"

export {
    Stepper,
    StepperNav,
    StepperItem,
    StepperTrigger,
    StepperIndicator,
    StepperSeparator,
    StepperPanel,
    StepperContent,
}