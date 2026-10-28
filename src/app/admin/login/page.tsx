"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Card, ErrorText, Field, inputClass } from "@/components/admin/ui";
import { api, auth, json } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await api<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: json(Object.fromEntries(new FormData(e.currentTarget))),
      });
      auth.setToken(accessToken);
      router.replace("/admin");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold">Admin login</h1>
        <form onSubmit={onSubmit} className="grid gap-4">
          <Field label="Email">
            <input name="email" type="email" required className={inputClass} />
          </Field>
          <Field label="Password">
            <input name="password" type="password" required className={inputClass} />
          </Field>
          <ErrorText error={error} />
          <Button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
        </form>
      </Card>
    </main>
  );
}
