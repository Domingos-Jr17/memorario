"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const { user, resendVerificationEmail, logout } = useAuth();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    setIsSending(true);
    try {
      await resendVerificationEmail();
      toast.success("Email de verificação enviado novamente!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao reenviar.");
    } finally {
      setIsSending(false);
    }
  };

  // Atualiza manualmente o estado do usuário para ver se já verificou o email
  const handleRefreshVerification = async () => {
    setIsRefreshing(true);
    try {
      await user?.reload(); // força o Firebase a atualizar o status
      if (user?.emailVerified) {
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
          disabled={isSending}
          className="w-full mb-4 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          {isSending ? "Enviando..." : "Reenviar Email de Verificação"}
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
