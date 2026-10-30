
"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Camera,
  Lock,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Settings,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function StudentSettingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState({
    id: "",
    full_name: "",
    email: "",
    number: "",
    avatar_url: "",
  });

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setMessage({ type: "", text: "" });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setMessage({
        type: "error",
        text: "Unable to load your account. Please sign in again.",
      });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, number, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Profile loading error:", error);

      setMessage({
        type: "error",
        text: "Failed to load your profile.",
      });

      setLoading(false);
      return;
    }

    setProfile({
      id: user.id,
      full_name: data.full_name || "",
      email: data.email || user.email || "",
      number: data.number || "",
      avatar_url: data.avatar_url || "",
    });

    setLoading(false);
  }

  function handleProfileChange(e) {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveProfile(e) {
    e.preventDefault();

    setSaving(true);
    setMessage({ type: "", text: "" });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setMessage({
        type: "error",
        text: "Your session has expired. Please sign in again.",
      });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name.trim(),
        number: profile.number.trim() || null,
        avatar_url: profile.avatar_url.trim() || null,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);

      setMessage({
        type: "error",
        text: "Could not update your profile. Please try again.",
      });
    } else {
      setMessage({
        type: "success",
        text: "Your profile has been updated successfully!",
      });
    }

    setSaving(false);
  }

  async function changePassword(e) {
    e.preventDefault();

    setMessage({ type: "", text: "" });

    if (passwords.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Your new password must contain at least 8 characters.",
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({
        type: "error",
        text: "The passwords do not match.",
      });
      return;
    }

    setChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: passwords.newPassword,
    });

    if (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } else {
      setPasswords({
        newPassword: "",
        confirmPassword: "",
      });

      setMessage({
        type: "success",
        text: "Your password has been changed successfully!",
      });
    }

    setChangingPassword(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#fe5933]" />
      </div>
    );
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-[#0b1b33] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#fe5933]">
            <Settings size={17} />
            Account settings
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Settings
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your profile and account preferences.
          </p>
        </div>

        {/* Messages */}
        {message.text && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {message.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Main settings */}
          <div className="space-y-6">

            {/* Profile */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-orange-50 p-3 text-[#fe5933]">
                  <UserRound size={21} />
                </div>

                <div>
                  <h2 className="font-bold">Personal information</h2>
                  <p className="text-sm text-gray-500">
                    Update your personal details.
                  </p>
                </div>
              </div>

              <form onSubmit={saveProfile} className="space-y-5">

                {/* Avatar */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#0b1b33] text-xl font-bold text-white">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div>
                    <p className="font-semibold">Profile picture</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Enter an image URL below to update your picture.
                    </p>
                  </div>
                </div>

                {/* Full name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                    <input
                      type="text"
                      name="full_name"
                      value={profile.full_name}
                      onChange={handleProfileChange}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#fe5933] focus:bg-white"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-3 pl-11 pr-4 text-sm text-gray-500 outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Your email address cannot be changed here.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone number
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                    <input
                      type="tel"
                      name="number"
                      value={profile.number}
                      onChange={handleProfileChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#fe5933] focus:bg-white"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Avatar image URL
                  </label>

                  <div className="relative">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                    <input
                      type="url"
                      name="avatar_url"
                      value={profile.avatar_url}
                      onChange={handleProfileChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#fe5933] focus:bg-white"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e94b28] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving ? "Saving..." : "Save changes"}
                </button>
              </form>
            </section>

            {/* Password */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Lock size={21} />
                </div>

                <div>
                  <h2 className="font-bold">Password and security</h2>
                  <p className="text-sm text-gray-500">
                    Keep your account secure.
                  </p>
                </div>
              </div>

              <form onSubmit={changePassword} className="space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    New password
                  </label>

                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#fe5933] focus:bg-white"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Confirm new password
                  </label>

                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#fe5933] focus:bg-white"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#0b1b33] px-6 py-3 text-sm font-semibold text-[#0b1b33] transition hover:bg-[#0b1b33] hover:text-white disabled:opacity-60"
                >
                  {changingPassword ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={18} />
                  )}

                  {changingPassword
                    ? "Updating..."
                    : "Update password"}
                </button>
              </form>
            </section>
          </div>

          {/* Account summary */}
          {/* <aside className="space-y-6">
            <div className="rounded-2xl bg-[#0b1b33] p-6 text-white shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <UserRound size={26} />
              </div>

              <h3 className="text-lg font-bold">
                {profile.full_name || "Student"}
              </h3>

              <p className="mt-1 break-all text-sm text-gray-300">
                {profile.email}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#fe5933]/20 px-3 py-2 text-xs font-semibold text-[#ff9b7e]">
                <span className="h-2 w-2 rounded-full bg-[#fe5933]" />
                Student account
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold">Account information</h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Account type</span>
                  <span className="font-semibold">Student</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Platform</span>
                  <span className="font-semibold">Sensey</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Security</span>
                  <span className="font-semibold text-green-600">
                    <ShieldCheck size={16} className="inline" /> Protected
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <div className="mb-2 flex items-center gap-2 font-bold text-[#fe5933]">
                <ShieldCheck size={19} />
                Security tip
              </div>

              <p className="text-sm leading-relaxed text-gray-600">
                Use a unique password and never share your account
                credentials with anyone.
              </p>
            </div>
          </aside> */}

        </div>
      </div>
    </div>
  );
}

