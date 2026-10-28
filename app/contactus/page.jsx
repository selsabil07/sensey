
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Send,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Clock,
  MapPin,
} from "lucide-react";
import Footer from "@/components/public/Footer";
import Navbar from "@/components/public/Navbar";
import Contact from "@/components/public/contact";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email us",
    description: "For general questions and inquiries.",
    value: "hello@sensey.com",
    href: "mailto:hello@sensey.com",
  },
  {
    icon: MessageCircle,
    title: "Platform support",
    description: "Need help with learning or teaching?",
    value: "We're here to help",
    href: "mailto:hello@sensey.com",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  function handleChange(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

    setStatus("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    setError("");

    try {
      // Connect this endpoint to your actual backend before launch.
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to send your message.");
      }

      setStatus("Your message has been sent successfully!");
      setForm(initialForm);
    } catch (err) {
      setError(
        err.message ||
          "We couldn't send your message. Please try again later."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <Navbar />
      <Contact />
      <Footer />
    </div>
  );
}
