
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
  GraduationCap,
  Sparkles,
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
    <div className="min-h-screen text-[#0b1b33] sm:px-6 ">
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

        <div className="">

          {/* Main settings */}

          <div className="w-full">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">

              {/* Personal information */}
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-7 flex items-center gap-3 border-b border-gray-100 pb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#fe5933]">
                    <UserRound size={21} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#0b1b33]">
                      Personal information
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Manage your personal details.
                    </p>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-5">

                  {/* Avatar */}
                  <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0b1b33] text-lg font-bold text-white">
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

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0b1b33]">
                        Profile picture
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        Add an image URL to personalize your profile.
                      </p>
                    </div>
                  </div>

                  {/* Full name */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#fe5933] focus:bg-white focus:ring-4 focus:ring-orange-50"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Phone number
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                      <input
                        type="tel"
                        name="number"
                        value={profile.number}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#fe5933] focus:bg-white focus:ring-4 focus:ring-orange-50"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  {/* Avatar URL */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Avatar image URL
                    </label>

                    <div className="relative">
                      <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                      <input
                        type="url"
                        name="avatar_url"
                        value={profile.avatar_url}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#fe5933] focus:bg-white focus:ring-4 focus:ring-orange-50"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e94b28] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </section>

              {/* Password and security */}
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-7 flex items-center gap-3 border-b border-gray-100 pb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Lock size={21} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#0b1b33]">
                      Password and security
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Keep your account protected.
                    </p>
                  </div>
                </div>

                <form onSubmit={changePassword} className="space-y-5">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#fe5933] focus:bg-white focus:ring-4 focus:ring-orange-50"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#fe5933] focus:bg-white focus:ring-4 focus:ring-orange-50"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={19} />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          Password protection
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-blue-700">
                          Choose a unique password with at least 8 characters to help
                          protect your account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0b1b33] px-6 py-3 text-sm font-semibold text-[#0b1b33] transition hover:bg-[#0b1b33] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {changingPassword ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <ShieldCheck size={18} />
                      )}

                      {changingPassword ? "Updating..." : "Update password"}
                    </button>
                  </div>
                </form>
              </section>

            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

