"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  CheckCircle2,
  Github,
  Handshake,
  Instagram,
  Mail,
  MessageSquarePlus,
  Send,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { contactContent } from "@/data/pages/contact.content";
import { useThemeColors } from "@/hooks/useThemeColors";

const TelegramIcon = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <Send
    size={size}
    className={className}
    style={{ transform: "rotate(-45deg) translateX(1px)" }}
    aria-hidden="true"
  />
);

type FormState = {
  user_name: string;
  user_email: string;
  message: string;
};

export default function ContactPage() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = contactContent[locale];
  const isFa = locale === "fa";

  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<FormState>({
    user_name: "",
    user_email: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));

    if (status === "error") {
      setStatus("idle");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formRef.current || status === "sending") return;

    const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceID || !templateID || !publicKey) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      await emailjs.sendForm(
        serviceID,
        templateID,
        formRef.current,
        publicKey,
      );

      setForm({
        user_name: "",
        user_email: "",
        message: "",
      });
      setStatus("success");
    } catch (error) {
      console.error("EmailJS send failed:", error);
      setStatus("error");
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <Link
          href="/"
          className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.textMuted}`}
        >
          {isFa ? (
            <ArrowRight size={16} aria-hidden="true" />
          ) : (
            <ArrowLeft size={16} aria-hidden="true" />
          )}
          {content.back}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <section aria-labelledby="contact-title">
            <div className="max-w-xl">
              <h1
                id="contact-title"
                className={`text-3xl font-black leading-tight tracking-[-0.025em] sm:text-4xl ${theme.text}`}
              >
                {content.hero.title}
              </h1>

              <p
                className={`mt-4 text-base leading-8 ${theme.textMuted}`}
              >
                {content.hero.lead}
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <section aria-labelledby="support-email-title">
                <h2
                  id="support-email-title"
                  className={`mb-3 text-xs font-black uppercase tracking-[0.14em] ${theme.textMuted}`}
                >
                  {content.supportEmail.title}
                </h2>

                <a
                  href={`mailto:${content.supportEmail.value}`}
                  className={`group flex min-h-14 items-center gap-3 rounded-[18px] border px-4 transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.card} ${theme.border}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
                  >
                    <Mail
                      size={18}
                      className={theme.accent}
                      aria-hidden="true"
                    />
                  </span>

                  <span
                    dir="ltr"
                    className={`min-w-0 flex-1 truncate text-start text-sm font-black ${theme.text}`}
                  >
                    {content.supportEmail.value}
                  </span>
                </a>
              </section>

              <section aria-labelledby="contact-help-title">
                <h2
                  id="contact-help-title"
                  className={`mb-3 text-xs font-black uppercase tracking-[0.14em] ${theme.textMuted}`}
                >
                  {content.helpBox.title}
                </h2>

                <div
                  className={`rounded-[20px] border p-4 sm:p-5 ${theme.card} ${theme.border}`}
                >
                  <ul className="space-y-4">
                    <HelpItem
                      icon={Handshake}
                      text={content.helpBox.items.cooperation}
                      theme={theme}
                    />
                    <HelpItem
                      icon={MessageSquarePlus}
                      text={content.helpBox.items.feature}
                      theme={theme}
                    />
                    <HelpItem
                      icon={Bug}
                      text={content.helpBox.items.bug}
                      theme={theme}
                    />
                  </ul>

                  <p
                    className={`mt-5 border-t pt-4 text-xs leading-6 ${theme.border} ${theme.textMuted}`}
                  >
                    {content.helpBox.footer}
                  </p>
                </div>
              </section>

              <section aria-labelledby="social-title">
                <h2
                  id="social-title"
                  className={`mb-3 text-xs font-black uppercase tracking-[0.14em] ${theme.textMuted}`}
                >
                  {content.social.title}
                </h2>

                <div className="flex flex-wrap gap-2">
                  <SocialLink
                    icon={Github}
                    href="https://github.com/Yuozarseiph"
                    label="GitHub"
                    theme={theme}
                  />
                  <SocialLink
                    icon={Instagram}
                    href="https://instagram.com/yousefshaker.dev"
                    label="Instagram"
                    theme={theme}
                  />
                  <SocialLink
                    icon={TelegramIcon}
                    href="https://t.me/developer_iranain"
                    label="Telegram"
                    theme={theme}
                  />
                </div>
              </section>
            </div>
          </section>

          <section
            aria-labelledby="contact-form-title"
            className={`self-start rounded-[24px] border p-5 sm:p-7 ${theme.card} ${theme.border}`}
          >
            {status === "success" ? (
              <div
                className="flex min-h-[28rem] flex-col items-center justify-center px-4 text-center"
                role="status"
                aria-live="polite"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--app-success-bg)] text-[var(--app-success-text)]">
                  <CheckCircle2 size={26} aria-hidden="true" />
                </div>

                <h2 className={`mt-5 text-xl font-black ${theme.text}`}>
                  {content.form.successTitle}
                </h2>

                <p
                  className={`mt-2 max-w-md text-sm leading-7 ${theme.textMuted}`}
                >
                  {content.form.successBody}
                </p>

                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className={`mt-6 min-h-11 rounded-full px-5 text-sm font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.secondary} ${theme.accent}`}
                >
                  {content.form.newMessage}
                </button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate={false}
              >
                <div className="mb-6">
                  <h2
                    id="contact-form-title"
                    className={`text-xl font-black ${theme.text}`}
                  >
                    {content.form.title}
                  </h2>
                </div>

                <div className="space-y-5">
                  <FormField
                    id="contact-name"
                    label={content.form.nameLabel}
                    theme={theme}
                  >
                    <input
                      id="contact-name"
                      required
                      type="text"
                      name="user_name"
                      autoComplete="name"
                      value={form.user_name}
                      onChange={(event) =>
                        updateField("user_name", event.target.value)
                      }
                      placeholder={content.form.namePlaceholder}
                      className={`min-h-12 w-full rounded-[15px] border bg-transparent px-4 text-sm outline-none transition-colors placeholder:opacity-50 focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-ring)] ${theme.border} ${theme.text}`}
                    />
                  </FormField>

                  <FormField
                    id="contact-email"
                    label={content.form.emailLabel}
                    theme={theme}
                  >
                    <input
                      id="contact-email"
                      required
                      type="email"
                      name="user_email"
                      autoComplete="email"
                      inputMode="email"
                      dir="ltr"
                      value={form.user_email}
                      onChange={(event) =>
                        updateField("user_email", event.target.value)
                      }
                      placeholder={content.form.emailPlaceholder}
                      className={`min-h-12 w-full rounded-[15px] border bg-transparent px-4 text-start text-sm outline-none transition-colors placeholder:opacity-50 focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-ring)] ${theme.border} ${theme.text}`}
                    />
                  </FormField>

                  <FormField
                    id="contact-message"
                    label={content.form.messageLabel}
                    theme={theme}
                  >
                    <textarea
                      id="contact-message"
                      required
                      rows={7}
                      name="message"
                      value={form.message}
                      onChange={(event) =>
                        updateField("message", event.target.value)
                      }
                      placeholder={content.form.messagePlaceholder}
                      className={`w-full resize-y rounded-[15px] border bg-transparent p-4 text-sm leading-7 outline-none transition-colors placeholder:opacity-50 focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-ring)] ${theme.border} ${theme.text}`}
                    />
                  </FormField>
                </div>

                <div
                  className="mt-5 min-h-6"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {status === "error" && (
                    <p
                      role="alert"
                      className="text-sm font-bold text-[var(--app-error-text)]"
                    >
                      {content.form.error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className={`mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] px-5 text-sm font-black text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] disabled:cursor-wait disabled:opacity-60 ${theme.primary}`}
                >
                  <span>
                    {status === "sending"
                      ? content.form.sending
                      : content.form.send}
                  </span>
                  <Send size={17} aria-hidden="true" />
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function FormField({
  id,
  label,
  theme,
  children,
}: {
  id: string;
  label: string;
  theme: any;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-2 block text-sm font-black ${theme.text}`}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function HelpItem({
  icon: Icon,
  text,
  theme,
}: {
  icon: any;
  text: string;
  theme: any;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] ${theme.secondary}`}
      >
        <Icon size={16} className={theme.accent} aria-hidden="true" />
      </span>

      <span className={`pt-1.5 text-sm leading-6 ${theme.text}`}>
        {text}
      </span>
    </li>
  );
}

function SocialLink({
  icon: Icon,
  href,
  theme,
  label,
}: {
  icon: any;
  href: string;
  theme: any;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.card} ${theme.border} ${theme.text}`}
    >
      <Icon size={17} className={theme.accent} />
      <span>{label}</span>
    </a>
  );
}
