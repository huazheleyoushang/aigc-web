"use client";

import { Phone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

/* ── Brand-colored icon wrappers ─────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.125C3.342 32.35 10.183 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

/* ── Modal ───────────────────────────────────────────────────── */
export function LoginModal({ open, onClose, onLoginSuccess }: LoginModalProps) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("请输入邮箱地址");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setLoading(true);

    try {
      // Mock 登录：用邮箱作为用户名，直接登录
      const user = {
        id: crypto.randomUUID(),
        username: email.trim(),
        createdAt: Date.now(),
      };
      setUser(user);
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.replace("/chat");
      }
      onClose();
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = (provider: string) => {
    alert(`${provider} 登录暂未接入，请使用邮箱登录`);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-200/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="w-full max-w-[380px] rounded-2xl bg-white px-8 pt-8 pb-6 shadow-lg">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 hover:cursor-pointer"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <div className="mb-6 text-center">
          <h2
            id="login-modal-title"
            className="text-xl font-semibold text-zinc-900"
          >
            登录或注册
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            你将获得更加智能的回复并能上传文件、图片等内容。
          </p>
        </div>

        {/* Social login buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleMockLogin("Google")}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:cursor-pointer"
          >
            <GoogleIcon />
            使用 Google 账户继续
          </button>

          <button
            type="button"
            onClick={() => handleMockLogin("Apple")}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:cursor-pointer"
          >
            <AppleIcon />
            使用 Apple 账户继续
          </button>

          <button
            type="button"
            onClick={() => handleMockLogin("Phone")}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:cursor-pointer"
          >
            <Phone className="h-4 w-4" />
            使用电话号码继续
          </button>
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs text-zinc-400">或</span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="电子邮件地址"
            className={`w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 ${
              error ? "border-red-400 bg-red-50" : ""
            }`}
            autoComplete="email"
            aria-describedby={error ? "email-error" : undefined}
            aria-invalid={!!error}
          />
          {error && (
            <p
              id="email-error"
              className="-mt-2 text-xs text-red-500"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-neutral-900 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "登录中…" : "继续"}
          </button>
        </form>
      </div>
    </div>
  );
}
