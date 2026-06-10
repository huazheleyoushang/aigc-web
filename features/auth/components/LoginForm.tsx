"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const storedUser = useAuthStore((s) => s.user);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          userId:
            storedUser?.username === username ? storedUser.id : undefined,
        }),
      });

      const data = (await res.json()) as {
        user?: { id: string; username: string; createdAt: number };
        error?: { message: string };
      };

      if (!res.ok || !data.user) {
        setError(data.error?.message ?? "账号或密码错误");
        return;
      }

      setUser(data.user);
      router.replace("/chat");
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-5 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)] text-lg font-bold text-white">
          A
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          登录 AIGC Chat
        </h1>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--text-secondary)]">
          账号
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          autoComplete="username"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--text-secondary)]">
          密码
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          autoComplete="current-password"
        />
      </div>

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--accent)] py-2.5 font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? "登录中…" : "登录"}
      </button>
    </form>
  );
}
