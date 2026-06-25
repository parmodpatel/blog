"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isSignup ? payload : {
        email: payload.email,
        password: payload.password,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Something went wrong.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-5 py-8 text-neutral-950">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:grid-cols-[1fr_0.9fr]">
          <div className="flex min-h-[540px] flex-col justify-between bg-neutral-950 p-8 text-white sm:p-10">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.18em]">
              Blogroom
            </Link>
            <div>
              <p className="mb-4 text-sm font-medium text-amber-200">
                {isSignup ? "Start publishing" : "Welcome back"}
              </p>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                {isSignup
                  ? "Create an account and post your first story."
                  : "Sign in to continue writing and managing posts."}
              </h1>
            </div>
            <p className="max-w-md text-sm leading-6 text-neutral-300">
              MongoDB stores accounts and posts. Cloudinary handles blog images
              when you upload one from the home page.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 sm:p-10">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                {isSignup ? "Create account" : "Log in"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                {isSignup ? "Signup" : "Login"}
              </h2>
            </div>

            {isSignup ? (
              <label className="grid gap-2 text-sm font-medium">
                Name
                <input
                  name="name"
                  required
                  className="h-12 rounded-md border border-neutral-300 px-4 outline-none transition focus:border-neutral-950"
                  placeholder="Your name"
                />
              </label>
            ) : null}

            <label className="grid gap-2 text-sm font-medium">
              Email
              <input
                name="email"
                type="email"
                required
                className="h-12 rounded-md border border-neutral-300 px-4 outline-none transition focus:border-neutral-950"
                placeholder="you@example.com"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Password
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="h-12 rounded-md border border-neutral-300 px-4 outline-none transition focus:border-neutral-950"
                placeholder="At least 8 characters"
              />
            </label>

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 rounded-md bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {loading ? "Please wait..." : isSignup ? "Create account" : "Login"}
            </button>

            <p className="text-sm text-neutral-600">
              {isSignup ? "Already have an account?" : "Need an account?"}{" "}
              <Link
                href={isSignup ? "/login" : "/signup"}
                className="font-semibold text-neutral-950 underline underline-offset-4"
              >
                {isSignup ? "Login" : "Signup"}
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
