"use client";

import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CheckCircle2} from "lucide-react";
import {ForgotPasswordInput, forgotPasswordSchema} from "@/types/schemas/auth.schema";
import {forgotPasswordAction} from "@/actions/auth.actions";
import Link from "next/link";

export default function ForgotPasswordForm() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<ForgotPasswordInput>({resolver: zodResolver(forgotPasswordSchema)});

    const onSubmit = async (data: ForgotPasswordInput) => {
        setError("");

        const result = await forgotPasswordAction(data);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setSuccess(true);
    };

    return (
        <div className="space-y-6 max-w-sm mx-auto">
            <div className="text-center">
                <h1 className="text-3xl text-(--secondary-color) font-black mt-2">
                    Forgot Password?
                </h1>
                <div className="mt-3 flex items-center justify-center gap-3">
                    <div className="h-0.5 w-20 bg-(--main-color) rounded-full"/>
                    <div className="h-3 w-3 rounded-full bg-(--main-color)"/>
                    <div className="h-0.5 w-20 bg-(--main-color) rounded-full"/>
                </div>
            </div>

            {success ? (
                <div className="space-y-6 animate-fadeIn mb-2">
                    <div
                        className="flex items-start gap-3 rounded-xl border border-emerald-600 bg-green-50 px-4 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0"/>
                        <p className="text-sm font-medium leading-relaxed text-slate-800">
                            We&#39;ve sent a password reset link to your email. It may take a few
                            seconds to arrive.
                        </p>
                    </div>


                    <Link
                        href="/login"
                        className="block w-full text-center rounded-xl py-3.5 text-sm font-semibold transition-all hover:bg-slate-50 border border-slate-200 text-(--secondary-color)"
                    >
                        Go back to Login
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    <p className="-mt-2 text-sm leading-relaxed text-center text-(--text-desc)">
                        Locked out? Give us your email address and
                        <br/>
                        we&apos;ll send a recovery link straight over.
                    </p>

                    {error && (
                        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-(--accent-color)">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-(--secondary-color)">
                                Email Address
                            </label>
                            <input
                                type="email"
                                {...register("email")}
                                placeholder="example@gmail.com"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-(--accent-color)">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 bg-(--main-color) cursor-pointer"
                        >
                            {isSubmitting ? "Sending Link..." : "Send Reset Email"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-(--text-desc) mb-2">
                        Remember your password?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-(--accent-color) hover:underline bg-transparent border-none p-0 cursor-pointer layout-inline"
                        >
                            Back to Login
                        </Link>
                    </p>
                </div>
            )}
        </div>
    )
}