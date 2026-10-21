"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoginInput, loginSchema } from "@/types/schemas/auth.schema";
import { signIn } from "next-auth/react";
import ReactivateAccountModal from "@/components/modals/ReactivateAccountModal";

export default function LoginForm() {
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [reactivationEmail, setReactivationEmail] = useState<string | null>(
    null,
  );
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (data: LoginInput) => {
    setErr("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (!result || result.error) {
      if (result?.code === "AccountDeactivated") {
        setReactivationEmail(data.email);
        return;
      }
      setErr("Invalid email or password.");
      return;
    }

    router.push("/home");
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { redirectTo: "/home" });
  };
  return (
    <div className="space-y-6 max-w-sm mx-auto">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl text-(--secondary-color) font-black mt-2 cursor-pointer">
          Login
        </h1>
        {/* Decorative divider */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="h-0.5 w-20 bg-(--main-color) rounded-full" />
          <div className="h-3 w-3 rounded-full bg-(--main-color)" />
          <div className="h-0.5 w-20 bg-(--main-color) rounded-full" />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-(--text-desc) text-center">
          Welcome back! Log in to catch up with vibrant
          <br />
          events happening around you.
        </p>
      </div>

      {/* Error */}
      {err && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-(--accent-color)">
          {err}
        </p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-(--secondary-color)">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder="example@gmail.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-(--accent-color)">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-(--secondary-color)">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer z-10 p-1"
            >
              {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-(--accent-color)">
              {errors.password.message}
            </p>
          )}
          {/* Forgot password */}
          <div className="mt-2 text-right">
            <a
              href="/forgot-password"
              className="text-sm font-medium text-(--accent-color) hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Submit */}
        {/*<Link href="/home">*/}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 bg-(--main-color) cursor-pointer"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
        {/*</Link>*/}
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-slate-200" />
        <span className="text-xs text-slate-400">Or</span>
        <hr className="flex-1 border-slate-200" />
      </div>

      {/* Google */}
      <button
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-(--secondary-color) transition-all hover:bg-slate-50 cursor-pointer"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Sign up link */}
      <p className="text-center text-sm text-(--text-desc) mb-2">
        {"Don't have an account?"}{" "}
        <a
          href="/signup"
          className="font-semibold text-(--accent-color) hover:underline bg-transparent border-none p-0 cursor-pointer layout-inline"
        >
          Sign Up
        </a>
      </p>

      {reactivationEmail && (
        <ReactivateAccountModal
          isOpen
          email={reactivationEmail}
          onClose={() => setReactivationEmail(null)}
        />
      )}
    </div>
  );
}
