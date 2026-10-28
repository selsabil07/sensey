
"use client";

import { useState } from "react";
import {
  Mail,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();

    // UI only: connect this form to an API to send messages.
    setStatus("Thanks for reaching out! The form is ready to be connected.");

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  }

  const contactItems = [
    {
      icon: Mail,
      title: "Email us",
      description: "Have a question? Send us a message.",
      value: "Contact our team",
      href: "mailto:hello@sensey.com",
    },
    {
      icon: MessageCircle,
      title: "We're here to help",
      description: "Questions about learning or teaching?",
      value: "Get in touch",
      href: "mailto:hello@sensey.com",
    },
  ];

  return (
    <section
      id="contact"
      className="relative px-6 py-24 text-white sm:px-10 lg:px-16"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#4776b1]/15 blur-[110px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#fe5933]/10 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200 backdrop-blur-xl">
            <MessageCircle className="h-4 w-4 text-[#fe5933]" />
            Contact us
          </span>

          <h2 className="mt-6 text-black text-4xl font-bold tracking-tight sm:text-5xl">
            Let's start a{" "}
            <span className="text-[#fe5933]">conversation.</span>
          </h2>

          <p className="mt-5 leading-7 text-slate-400 sm:text-lg">
            Have a question, an idea, or feedback? We'd love to hear from you.
            Send us a message and let's make learning better together.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Contact information */}
          <div className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-blue-950 p-7 backdrop-blur-xl sm:p-9">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#4776b1]/20 blur-3xl" />

            <div className="relative">
              <h3 className="text-2xl font-semibold">
                Get in touch
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Whether you're a student, teacher, or just curious about Sensey,
                we're happy to hear from you.
              </p>
            </div>

            {contactItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="group relative flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-[#4776b1]/50 hover:bg-white/[0.06]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4776b1]/15 text-[#8aafff]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {item.description}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#fe7657]">
                      {item.value}
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </span>
                  </div>
                </a>
              );
            })}

            <div className="relative mt-auto rounded-2xl border border-[#fe5933]/20 bg-[#fe5933]/[0.06] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fe5933]/15">
                  <MapPin className="h-5 w-5 text-[#fe7657]" />
                </div>
                <div>
                  <p className="font-medium">Our mission</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Making education more accessible and engaging.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-blue-950 p-7 backdrop-blur-xl sm:p-9"
          >
            <h3 className="text-2xl font-semibold">
              Send us a message
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Fill out the form below and tell us how we can help.
            </p>

            {status && (
              <div
                role="status"
                className="mt-6 flex gap-3 rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-sm text-green-300"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {status}
              </div>
            )}

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Your name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0b1b33]/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-[#4776b1] focus:ring-2 focus:ring-[#4776b1]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0b1b33]/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-[#4776b1] focus:ring-2 focus:ring-[#4776b1]/20"
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="contact-subject"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Subject
              </label>
              <input
                id="contact-subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                required
                className="w-full rounded-xl border border-white/10 bg-[#0b1b33]/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-[#4776b1] focus:ring-2 focus:ring-[#4776b1]/20"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="contact-message"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us a little more..."
                rows={5}
                required
                className="w-full resize-y rounded-xl border border-white/10 bg-[#0b1b33]/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-[#4776b1] focus:ring-2 focus:ring-[#4776b1]/20"
              />
            </div>

            <button
              type="submit"
              className="group mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#fe5933] px-6 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff704d] hover:shadow-lg hover:shadow-[#fe5933]/20"
            >
              Send message
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              Your message form needs a backend connection before messages can
              actually be delivered.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
