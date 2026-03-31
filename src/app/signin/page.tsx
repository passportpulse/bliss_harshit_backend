"use client";

import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.message || "Login failed");
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#020d1a] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            E-commerce Admin Sign In
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access the e-commerce admin dashboard
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-[#1a2332]">
          <form onSubmit={handleSubmit}>
            <InputGroup
              type="email"
              label="Email"
              className="mb-4 [&_input]:py-[15px]"
              placeholder="Enter your email"
              name="email"
              handleChange={handleChange}
              value={formData.email}
              icon={<EmailIcon />}
              required
            />

            <InputGroup
              type="password"
              label="Password"
              className="mb-6 [&_input]:py-[15px]"
              placeholder="Enter your password"
              name="password"
              handleChange={handleChange}
              value={formData.password}
              icon={<PasswordIcon />}
              required
            />

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 