import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";
import api from "@/lib/apiClient";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast.error("Enter your email first");
      return;
    }

    setResetLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, { redirectTo });
      if (error) throw error;
      toast.success("Password reset link sent to your email");
      setResetMode(false);
    } catch (error) {
      toast.error(error?.message || "Unable to send reset link");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
    <div className="layout-shell min-h-screen grid place-items-center py-10">
      <form className="surface p-8 w-full max-w-md space-y-3" onSubmit={onSubmit}>
        <h1 className="text-2xl font-semibold">Login</h1>
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div className="flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            className="text-stone-600 underline underline-offset-4 hover:text-(--accent-strong)"
            onClick={() => setResetMode((prev) => !prev)}
          >
            Forgot password?
          </button>
          <Link href="/signup" className="underline text-stone-600 hover:text-(--accent-strong)">Sign up</Link>
        </div>

        {resetMode ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
            <p className="text-sm text-stone-700">We&apos;ll email you a link to set a new password.</p>
            <button className="btn btn-primary w-full" type="button" onClick={onResetPassword} disabled={resetLoading}>
              {resetLoading ? "Sending reset link..." : "Send reset link"}
            </button>
          </div>
        ) : null}

        <button className="btn btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        <p className="text-sm text-stone-600">No account? <Link href="/signup" className="underline">Sign up</Link></p>
      </form>
    </div>

    <Footer />
    </>
  );
}
