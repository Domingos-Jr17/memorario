/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { auth } from '@/lib/firebase';
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const { user, resendVerificationEmail, logout } = useAuth();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Redireciona se não estiver logado ou se já tiver verificado
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.emailVerified) {
      router.push("/");
    }
  }, [user, router]);

  // Reenvio do email
  const handleResend = async () => {
    if (cooldown > 0) return;

    setIsSending(true);
    try {
      await resendVerificationEmail();
      toast.success("Verification email sent again!");
      setCooldown(60); // Inicia cooldown de 60 segundos
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Error resending email.");
    } finally {
      setIsSending(false);
    }
  };

  // Atualiza manualmente o estado do usuário para ver se já verificou o email
  const handleRefreshVerification = async () => {
    setIsRefreshing(true);
    try {
      await user?.reload(); // força o Firebase a atualizar o status
      if (auth.currentUser?.emailVerified) {
        toast.success("Email verificado com sucesso!");
        router.push("/");
      } else {
        toast.warning("Email ainda não verificado.");
      }
    } catch (error: any) {
      toast.error("Erro ao verificar email.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error: any) {
      toast.error("Erro ao sair.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
        <h1 className="text-2xl font-bold mb-4">Verifique seu Email</h1>
        <p className="text-gray-700 mb-4">
          Enviamos um email de verificação para <strong>{user?.email}</strong>.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Clique no link enviado para ativar sua conta.
        </p>

        <button
          onClick={handleResend}
          disabled={isSending || cooldown > 0}
          className={`w-full mb-4 text-white py-2 rounded transition ${
            isSending || cooldown > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isSending
            ? "Sending..."
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend Verification Email"}
        </button>

        <button
          onClick={handleRefreshVerification}
          disabled={isRefreshing}
          className="w-full mb-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          {isRefreshing ? "Verificando..." : "Já verifiquei, tentar novamente"}
        </button>

        <button
          onClick={handleLogout}
          className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition"
        >
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
