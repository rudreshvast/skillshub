"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/context/auth";

export default function Home() {
  const router = useRouter();
  const { token, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
    const tokenExists = localStorage.getItem("token");
    if (tokenExists) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return null;
}