"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="h-10 rounded-md border border-[#3b4250] px-4 text-sm font-semibold text-[#dbe3ee] transition hover:border-[#8ab4f8] hover:text-white disabled:cursor-not-allowed disabled:text-[#7c8594]"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
