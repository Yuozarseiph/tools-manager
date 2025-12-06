"use client";

import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Send,
  Github,
  Instagram,
  MessageSquarePlus,
  Bug,
  Handshake,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { useLanguage } from "@/context/LanguageContext";

// آیکون تلگرام کاستوم
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
    style={{ transform: "rotate(-45deg) translateX(2px)" }}
  />
);

export default function ContactPage() {
  const theme = useThemeColors();
  const { t } = useLanguage();

  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    user_name: "",
    user_email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
    const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

    if (formRef.current) {
      emailjs
        .sendForm(serviceID, templateID, formRef.current, publicKey)
        .then(
          () => {
            setStatus("success");
            setForm({ user_name: "", user_email: "", message: "" });
          },
          (error) => {
            console.error(error);
            setStatus("error");
          }
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-6xl mx-auto px-6 pt-10 w-full pb-20">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-8 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" /> {t("contact.back")}
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* ستون اطلاعات */}
          <div className="space-y-8">
            <div>
              <h1
                className={`text-4xl md:text-5xl font-black mb-6 ${theme.text}`}
              >
                {t("contact.hero.title")}
              </h1>
              <p
                className={`text-lg leading-relaxed ${theme.textMuted}`}
              >
                {t("contact.hero.lead")}
              </p>
            </div>

            <div className="space-y-6">
              <ContactItem
                icon={Mail}
                title={t("contact.supportEmail.title")}
                value={t("contact.supportEmail.value")}
                theme={theme}
              />
            </div>

            {/* توضیحات همکاری و گزارش */}
            <div
              className={`p-6 rounded-2xl border ${theme.border} bg-gray-50/50 dark:bg-white/5 space-y-4`}
            >
              <h3 className={`font-bold text-lg ${theme.text}`}>
                {t("contact.helpBox.title")}
              </h3>

              <div className="space-y-3">
                <FeatureItem
                  icon={Handshake}
                  text={t("contact.helpBox.items.cooperation")}
                  theme={theme}
                />
                <FeatureItem
                  icon={MessageSquarePlus}
                  text={t("contact.helpBox.items.feature")}
                  theme={theme}
                />
                <FeatureItem
                  icon={Bug}
                  text={t("contact.helpBox.items.bug")}
                  theme={theme}
                />
              </div>

              <p
                className={`text-sm mt-4 pt-4 border-t border-dashed ${theme.border} ${theme.textMuted}`}
              >
                {t("contact.helpBox.footer")}
              </p>
            </div>

            <div className="pt-4">
              <h3 className={`text-sm font-bold mb-4 ${theme.textMuted}`}>
                {t("contact.social.title")}
              </h3>
              <div className="flex gap-4">
                <SocialBtn
                  icon={Github}
                  href="https://github.com/Yuozarseiph"
                  theme={theme}
                  label="Github"
                />
                <SocialBtn
                  icon={Instagram}
                  href="https://instagram.com/yousefshaker.dev"
                  theme={theme}
                  label="Instagram"
                />
                <SocialBtn
                  icon={TelegramIcon}
                  href="https://t.me/developer_iranain"
                  theme={theme}
                  label="Telegram"
                />
              </div>
            </div>
          </div>

          {/* ستون فرم */}
          <div
            className={`p-8 rounded-3xl border shadow-xl ${theme.card} ${theme.border}`}
          >
            {status === "success" ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                  <Send size={40} />
                </div>
                <h3 className={`text-2xl font-bold ${theme.text}`}>
                  {t("contact.form.successTitle")}
                </h3>
                <p className={theme.textMuted}>
                  {t("contact.form.successBody")}
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-blue-500 font-bold hover:underline"
                >
                  {t("contact.form.newMessage")}
                </button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <h3
                  className={`text-xl font-bold mb-6 ${theme.text}`}
                >
                  {t("contact.form.title")}
                </h3>

                <div className="space-y-2">
                  <label
                    className={`text-sm font-bold ${theme.textMuted}`}
                  >
                    {t("contact.form.nameLabel")}
                  </label>
                  <input
                    required
                    type="text"
                    name="user_name"
                    value={form.user_name}
                    onChange={(e) =>
                      setForm({ ...form, user_name: e.target.value })
                    }
                    className={`w-full p-4 rounded-xl border outline-none focus:ring-2 ring-blue-500/20 transition-all ${theme.bg} ${theme.border} ${theme.text}`}
                    placeholder={t("contact.form.namePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className={`text-sm font-bold ${theme.textMuted}`}
                  >
                    {t("contact.form.emailLabel")}
                  </label>
                  <input
                    required
                    type="email"
                    name="user_email"
                    value={form.user_email}
                    onChange={(e) =>
                      setForm({ ...form, user_email: e.target.value })
                    }
                    className={`w-full p-4 rounded-xl border outline-none focus:ring-2 ring-blue-500/20 transition-all ${theme.bg} ${theme.border} ${theme.text}`}
                    placeholder={t("contact.form.emailPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className={`text-sm font-bold ${theme.textMuted}`}
                  >
                    {t("contact.form.messageLabel")}
                  </label>
                  <textarea
                    required
                    rows={5}
                    name="message"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className={`w-full p-4 rounded-xl border outline-none resize-none focus:ring-2 ring-blue-500/20 transition-all ${theme.bg} ${theme.border} ${theme.text}`}
                    placeholder={t("contact.form.messagePlaceholder")}
                  />
                </div>

                {status === "error" && (
                  <div className="text-red-500 text-sm font-bold text-center">
                    {t("contact.form.error")}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    status === "sending"
                      ? "bg-zinc-400 cursor-wait"
                      : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                  }`}
                >
                  {status === "sending" ? (
                    t("contact.form.sending")
                  ) : (
                    <>
                      <span>{t("contact.form.send")}</span>
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// زیرکامپوننت‌ها همان قبلی، فقط متن از props می‌آید

function ContactItem({ icon: Icon, title, value, theme }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors group-hover:scale-110 duration-300 ${theme.secondary}`}
      >
        <Icon size={24} className={theme.accent} />
      </div>
      <div>
        <p
          className={`text-sm font-bold opacity-60 ${theme.textMuted}`}
        >
          {title}
        </p>
        <p className={`text-lg font-semibold ${theme.text}`}>{value}</p>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, text, theme }: any) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-blue-500" />
      <span className={`text-sm font-medium ${theme.text}`}>{text}</span>
    </div>
  );
}

function SocialBtn({ icon: Icon, href, theme, label }: any) {
  return (
    <a
      href={href}
      target="_blank"
      className={`p-3 rounded-xl border transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:-translate-y-1 hover:shadow-lg ${theme.border} ${theme.textMuted} hover:text-blue-500`}
      title={label}
    >
      <Icon size={24} />
    </a>
  );
}
