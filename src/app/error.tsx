"use client"

import Link from "next/link"
import {useSession} from "next-auth/react"
import {Home, RotateCcw} from "lucide-react"
import type {Role} from "@/types/common.type"

const ROLE_HOME_PATHS: Record<Role, string> = {
    User: "/home", Organizer: "/organizer", Moderator: "/moderator", Admin: "/system-admin",
}

export default function Error({
                                  reset,
                              }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const {data: session} = useSession()
    const role = session?.user?.role as Role | undefined
    const homePath = role ? ROLE_HOME_PATHS[role] : "/home"

    return (<div
            className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--background-color)] px-6 font-[family-name:var(--font-rounded)]">
            <div className="relative flex select-none items-center justify-center">
        <span
            className="text-[clamp(144px,30vw,272px)] font-bold leading-none tracking-tight"
            style={{color: "var(--main-color)"}}>
          5
        </span>
                <span
                    className="text-[clamp(144px,30vw,272px)] font-bold leading-none tracking-tight"
                    style={{color: "var(--main-color)", opacity: 0.55}}>
          0
        </span>
                <span
                    className="text-[clamp(144px,30vw,272px)] font-bold leading-none tracking-tight"
                    style={{color: "var(--main-color)"}}>
          0
        </span>

                {/* Overlapping navy text, like "OOOps! Page Not Found" */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
              className="text-[clamp(36px,8vw,72px)] font-semibold leading-none"
              style={{color: "var(--secondary-color)"}}
          >
            OOOps!
          </span>
                    <span
                        className="mt-1 text-[clamp(28px,6.5vw,60px)] font-bold leading-none"
                        style={{color: "var(--secondary-color)"}}
                    >
            Server Error
          </span>
                </div>
            </div>

            <p
                className="mt-6 max-w-sm text-center text-[15px] font-medium leading-relaxed"
                style={{color: "var(--text-secondary)"}}
            >
                Something went wrong on our end.
                <br/>
                Please try again or head back to the homepage.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                    onClick={() => reset()}
                    className="flex h-12 w-44 items-center justify-center gap-2 rounded-[15px] text-[15px] font-medium transition-opacity hover:opacity-90"
                    style={{backgroundColor: "var(--secondary-color)", color: "var(--btn-text)"}}
                >
                    <RotateCcw size={18}/>
                    Try again
                </button>

                <Link
                    href={homePath}
                    className="flex h-12 w-44 items-center justify-center gap-2 rounded-[15px] text-[15px] font-medium transition-opacity hover:opacity-90"
                    style={{backgroundColor: "var(--main-color)", color: "var(--btn-text)"}}
                >
                    <Home size={18}/>
                    Back to homepage
                </Link>
            </div>
        </div>)
}
