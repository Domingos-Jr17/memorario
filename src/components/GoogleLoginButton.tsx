/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const GoogleLoginButton = () => {
  const { googleSignIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleSignIn();
      toast.success("Login with Google successful!");
      router.push("/");
    } catch (err: any) {
      const errorMsg = err?.message || "Unexpected error during Google login.";
      toast.error(`Google login failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      aria-label="Sign in with Google"
      className={`mt-6 w-full flex items-center justify-center px-4 py-2 rounded-md border border-input shadow-sm bg-background text-text hover:bg-accent transition duration-150 ease-in-out ${
        loading ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        <Loader2 className="animate-spin h-5 w-5 text-gray-500" aria-hidden="true" />
      ) : (
        <>
          <svg
            className="h-5 w-5 mr-2"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fill="#4285f4"
              d="M533.5 278.4c0-17.4-1.5-34.1-4.4-50.3H272.1v95.3h146.8c-6.3 34-25.2 62.9-53.6 82.1v68.2h86.6c50.7-46.7 81.6-115.6 81.6-195.3z"
            />
            <path
              fill="#34a853"
              d="M272.1 544.3c72.6 0 133.6-24.1 178.2-65.3l-86.6-68.2c-23.8 16-54.4 25.3-91.6 25.3-70.4 0-130.1-47.5-151.4-111.3H32.4v69.9c44.9 88.4 137.8 149.6 239.7 149.6z"
            />
            <path
              fill="#fbbc04"
              d="M120.7 324.8c-10.5-31-10.5-64.5 0-95.5V159.4H32.4c-35.2 70.4-35.2 153.8 0 224.2l88.3-68.8z"
            />
            <path
              fill="#ea4335"
              d="M272.1 107.3c39.5-.6 77.5 14 106.5 40.6l79.5-79.5C417.2 23.4 345.6-.6 272.1 0c-101.9 0-194.8 61.2-239.7 149.6l88.3 69.9C142 154.8 201.7 107.3 272.1 107.3z"
            />
          </svg>
          <span className="text-sm font-medium">Sign in with Google</span>
        </>
      )}
    </motion.button>
  );
};
