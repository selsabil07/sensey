
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UserRound,
  ShieldCheck,
  Bell,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  LockKeyhole,
  RefreshCw,
  Camera,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAVY = "#0b1b33";
const ORANGE = "#fe5933";

const initialProfile = {
  full_name: "",
  number: "",
  subject: "",
  bio: "",
  avatar_url: "",
};

function getInitials(name) {
  return (name || "Teacher")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export default function TeacherSettingsPage() {
  const [profile, setProfile] = useState(initialProfile);
  const [originalProfile, setOriginalProfile] = useState(initialProfile);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    courseUpdates: true,
  });

  const loadProfile = useCallback(async () => {
    const supabase = createClient();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      setEmail(user.email || "");
      setUserId(user.id);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, number, subject, bio, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!data) {
        throw new Error(
          "Your profile was not found. Please contact your administrator."
        );
      }

      if (data.role !== "teacher") {
        throw new Error("This page is available to teacher accounts only.");
      }

      const values = {
        full_name: data.full_name || "",
        number: data.number || "",
        subject: data.subject || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
      };

      setProfile(values);
      setOriginalProfile(values);
    } catch (err) {
      console.error("Failed to load teacher settings:", err);
      setError(err.message || "Unable to load your settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();

    try {
      const stored = window.localStorage.getItem(
        "sensey-teacher-preferences"
      );

      if (stored) {
        setPreferences((previous) => ({
          ...previous,
          ...JSON.parse(stored),
        }));
      }
    } catch (err) {
      console.error("Could not load local preferences:", err);
    }
  }, [loadProfile]);

  function updateField(field, value) {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function saveProfile(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!profile.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (
      profile.avatar_url.trim() &&
      !/^https?:\/\/\S+$/i.test(profile.avatar_url.trim())
    ) {
      setError("Enter a valid HTTP or HTTPS profile image URL.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user || user.id !== userId) {
        throw new Error("Your session changed. Please reload the page.");
      }

      const updates = {
        full_name: profile.full_name.trim(),
        number: profile.number.trim() || null,
        subject: profile.subject.trim() || null,
        bio: profile.bio.trim() || null,
        avatar_url: profile.avatar_url.trim() || null,
      };

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select("id");

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error(
          "The profile was not updated. Check your Supabase UPDATE policy."
        );
      }

      const saved = {
        full_name: updates.full_name,
        number: updates.number || "",
        subject: updates.subject || "",
        bio: updates.bio || "",
        avatar_url: updates.avatar_url || "",
      };

      setProfile(saved);
      setOriginalProfile(saved);
      setSuccess("Your profile has been saved successfully.");
    } catch (err) {
      console.error("Failed to save teacher profile:", err);
      setError(err.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function sendPasswordReset() {
    setError("");
    setSuccess("");

    if (!email) {
      setError("No email address is associated with your account.");
      return;
    }

    setSendingReset(true);

    try {
      const supabase = createClient();

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email);

      if (resetError) throw resetError;

      setSuccess(
        "Password-reset instructions have been requested. Check your inbox and spam folder."
      );
    } catch (err) {
      console.error("Password reset request failed:", err);
      setError(err.message || "Unable to request a password reset.");
    } finally {
      setSendingReset(false);
    }
  }

  function savePreferences(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      window.localStorage.setItem(
        "sensey-teacher-preferences",
        JSON.stringify(preferences)
      );

      setSuccess("Your preferences have been saved in this browser.");
    } catch (err) {
      console.error("Failed to save preferences:", err);
      setError("Could not save preferences in this browser.");
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "preferences", label: "Preferences", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-500">
        <LoaderCircle size={22} className="animate-spin" />
        Loading your settings...
      </div>
    );
  }

  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-7 p-10 sm:p-12">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Teacher workspace / Account
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your profile, account security, and preferences.
        </p>
      </div>

      {(error || success) && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error ? (
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          )}
          <p>{error || success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Settings navigation */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Account settings
          </p>

          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setError("");
                  setSuccess("");
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  activeTab === id
                    ? "bg-[#0b1b33] text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-6">
          {/* PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={saveProfile} className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Public profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Update the information associated with your teacher account.
                  </p>
                </div>

                <div className="flex flex-col gap-4 border-b border-slate-100 py-6 sm:flex-row sm:items-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="h-20 w-20 rounded-full border border-slate-200 object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
                      style={{ backgroundColor: NAVY }}
                    >
                      {getInitials(profile.full_name)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">
                      {profile.full_name || "Teacher"}
                    </p>
                    <p className="mt-1 break-all text-sm text-slate-500">
                      {email}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Add an image URL below to change your picture.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 pt-6 sm:grid-cols-2">
                  <Field label="Full name">
                    <input
                      className={inputClass}
                      value={profile.full_name}
                      onChange={(event) =>
                        updateField("full_name", event.target.value)
                      }
                      placeholder="Your full name"
                      maxLength={120}
                      required
                    />
                  </Field>

                  <Field label="Email address" hint="Managed by Supabase authentication.">
                    <input
                      className={`${inputClass} cursor-not-allowed bg-slate-50`}
                      value={email}
                      readOnly
                    />
                  </Field>

                  <Field label="Phone number">
                    <input
                      className={inputClass}
                      value={profile.number}
                      onChange={(event) =>
                        updateField("number", event.target.value)
                      }
                      placeholder="Your phone number"
                      maxLength={30}
                    />
                  </Field>

                  <Field label="Teaching subject">
                    <input
                      className={inputClass}
                      value={profile.subject}
                      onChange={(event) =>
                        updateField("subject", event.target.value)
                      }
                      placeholder="e.g. Mathematics"
                      maxLength={120}
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field
                      label="Profile image URL"
                      hint="Use a direct image URL. This does not upload a file."
                    >
                      <div className="relative">
                        <Camera
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          className={`${inputClass} pl-10`}
                          type="url"
                          value={profile.avatar_url}
                          onChange={(event) =>
                            updateField("avatar_url", event.target.value)
                          }
                          placeholder="https://example.com/profile.jpg"
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="About me"
                      hint="Introduce yourself to your students."
                    >
                      <textarea
                        className={`${inputClass} min-h-32 resize-y`}
                        value={profile.bio}
                        onChange={(event) =>
                          updateField("bio", event.target.value)
                        }
                        placeholder="Write a short introduction..."
                        maxLength={1000}
                      />
                      <p className="text-right text-xs text-slate-400">
                        {profile.bio.length}/1000
                      </p>
                    </Field>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(originalProfile);
                      setError("");
                      setSuccess("");
                    }}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Discard changes
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: ORANGE }}
                  >
                    {saving ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </section>
            </form>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <LockKeyhole size={22} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-slate-900">
                      Password and account security
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Request a password-reset email to securely change your
                      account password.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Account email
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                    {email || "No email available"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={sendPasswordReset}
                  disabled={sendingReset || !email}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: NAVY }}
                >
                  {sendingReset ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <RefreshCw size={17} />
                  )}
                  {sendingReset
                    ? "Requesting..."
                    : "Send password-reset email"}
                </button>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <h2 className="font-bold text-slate-900">
                  Account information
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Your teacher identity is managed through Sensey's
                  authentication system.
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-sm text-slate-600">Account role</span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    Teacher
                  </span>
                </div>
              </section>
            </>
          )}

          {/* PREFERENCES */}
          {activeTab === "preferences" && (
            <form
              onSubmit={savePreferences}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
            >
              <h2 className="text-lg font-bold text-slate-900">
                Notification preferences
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose your preferred notification options.
              </p>

              <div className="mt-6 divide-y divide-slate-100">
                <label className="flex cursor-pointer items-start justify-between gap-4 py-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Email notifications
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Preference for receiving account and platform updates by email.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(event) =>
                      setPreferences((previous) => ({
                        ...previous,
                        emailNotifications: event.target.checked,
                      }))
                    }
                    className="mt-1 h-5 w-5 accent-[#fe5933]"
                  />
                </label>

                <label className="flex cursor-pointer items-start justify-between gap-4 py-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Course updates
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Preference for updates related to your courses and students.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={preferences.courseUpdates}
                    onChange={(event) =>
                      setPreferences((previous) => ({
                        ...previous,
                        courseUpdates: event.target.checked,
                      }))
                    }
                    className="mt-1 h-5 w-5 accent-[#fe5933]"
                  />
                </label>
              </div>

              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                These preferences are saved in this browser only. They do not
                enable or disable actual email delivery yet.
              </p>

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: ORANGE }}
                >
                  <Save size={17} />
                  Save preferences
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
