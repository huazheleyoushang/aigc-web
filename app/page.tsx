"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { BrandLogo } from "@/features/chat/components/BrandLogo";
import { LoginModal } from "@/features/auth/components/LoginModal";
import { LINE_ICONS, LineIcon } from "@/components/LineIcon";

const SUGGESTIONS = [
  { label: "生成图片", icon: LINE_ICONS.grid },
  { label: "撰写或编辑", icon: LINE_ICONS.pencil },
  { label: "查找资料", icon: LINE_ICONS.search },
];

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [loginOpen, setLoginOpen] = useState(false);

  // 未登录用户直接跳转到聊天页（游客模式）
  useEffect(() => {
    if (!user) {
      router.replace("/chat");
    }
  }, [user, router]);

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    router.push("/chat");
  };

  // 已登录用户：显示带输入框的首页
  if (user) {
    return (
      <>
        <div className="flex h-screen flex-col bg-[#f9fafb]">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <BrandLogo />
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="rounded-full bg-[#e0e0e0] px-5 py-2 text-sm font-medium text-[#333] transition hover:bg-[#d0d0d0] hover:cursor-pointer"
            >
              登录
            </button>
          </div>

          {/* Center content */}
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <h1 className="mb-8 text-2xl font-medium text-[var(--text-primary)]">
              今天有什么计划？
            </h1>

            {/* Input area */}
            <div className="w-full max-w-3xl">
              <div className="flex items-start gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] focus-within:border-[var(--accent)] focus-within:shadow-[0_4px_24px_rgba(77,107,254,0.12)]">
                <button
                  type="button"
                  aria-label="添加附件"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-gray-100 hover:cursor-pointer"
                >
                  <LineIcon name={LINE_ICONS.plus} size={18} />
                </button>
                <textarea
                  readOnly
                  placeholder="有问题，尽管问"
                  className="flex-1 resize-none bg-transparent text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                  rows={1}
                />
                <button
                  type="button"
                  aria-label="语音输入"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-gray-100 hover:cursor-pointer"
                >
                  <LineIcon name={LINE_ICONS.microphone} size={16} />
                </button>
                <button
                  type="button"
                  aria-label="音频输入"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--text-primary)] text-white transition hover:opacity-80 hover:cursor-pointer"
                >
                  <LineIcon name={LINE_ICONS.bolt} size={16} />
                </button>
              </div>

              {/* Suggestion pills */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs text-[var(--text-secondary)] transition hover:bg-gray-50 hover:cursor-pointer"
                  >
                    <LineIcon name={item.icon} size={14} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <LoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  // 加载中：不显示任何内容
  return null;
}
