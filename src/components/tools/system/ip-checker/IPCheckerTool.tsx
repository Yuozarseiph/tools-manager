"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Wifi,
  Server,
  Globe2,
  RefreshCw,
  ShieldAlert,
  Copy,
  Check,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useIPCheckerContent,
  type IPCheckerToolContent,
} from "./ip-checker.content";

interface IPInfo {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  country_code: string;
  org: string;
  asn: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currency: string;
}

export default function IPCheckerTool() {
  const theme = useThemeColors();
  const content: IPCheckerToolContent = useIPCheckerContent();

  const [data, setData] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchIP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("IP fetch error");
      const json = await res.json();
      setData(json);
    } catch {
      setError(content.ui.main.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyIP = () => {
    if (data?.ip) {
      navigator.clipboard.writeText(data.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid gap-8">
      {/* باکس اصلی IP */}
      <div
        className={`relative overflow-hidden p-8 rounded-3xl border shadow-lg text-center ${theme.card} ${theme.border}`}
      >
        {/* دکمه رفرش */}
        <button
          onClick={fetchIP}
          disabled={loading}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
            loading ? "animate-spin text-blue-500" : "text-zinc-400"
          }`}
          title={content.ui.main.refreshTitle}
        >
          <RefreshCw size={20} />
        </button>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-sm animate-pulse ${theme.textMuted}`}>
              {content.ui.main.loading}
            </p>
          </div>
        ) : error ? (
          <div className="text-red-500 py-8 flex flex-col items-center gap-2">
            <ShieldAlert size={48} />
            <p>{error}</p>
            <button
              onClick={fetchIP}
              className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
            >
              {content.ui.main.retry}
            </button>
          </div>
        ) : data ? (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              className={`text-sm font-bold mb-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}
            >
              {content.ui.main.publicIpLabel}
            </div>

            <div
              className="flex items-center gap-3 mb-6 group cursor-pointer"
              onClick={copyIP}
            >
              <h2
                className={`text-5xl md:text-6xl font-black tracking-tight font-mono ${theme.text}`}
              >
                {data.ip}
              </h2>
              <div
                className={`p-2 rounded-xl transition-colors ${
                  copied
                    ? "text-green-500 bg-green-50"
                    : "text-zinc-300 group-hover:text-blue-500"
                }`}
              >
                {copied ? <Check size={24} /> : <Copy size={24} />}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-6">
              <Badge
                icon={MapPin}
                text={`${data.city}, ${data.country_name}`}
                theme={theme}
              />
              <Badge icon={Server} text={data.org} theme={theme} />
              <Badge icon={Globe2} text={data.timezone} theme={theme} />
            </div>
          </div>
        ) : null}
      </div>

      {/* جزئیات بیشتر */}
      {data && !loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DetailCard
            title={content.ui.details.countryTitle}
            value={data.country_name}
            sub={data.country_code}
            flag={true}
            theme={theme}
          />
          <DetailCard
            title={content.ui.details.regionTitle}
            value={data.region}
            sub={data.city}
            theme={theme}
          />
          <DetailCard
            title={content.ui.details.coordsTitle}
            value={`${data.latitude}`}
            sub={`${data.longitude}`}
            theme={theme}
          />
          <DetailCard
            title={content.ui.details.ispTitle}
            value={data.org}
            sub={data.asn}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
}

function Badge({ icon: Icon, text, theme }: any) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50 ${theme.text} ${theme.border}`}
    >
      <Icon size={16} className="text-blue-500" />
      <span className="text-sm font-bold">{text}</span>
    </div>
  );
}

function DetailCard({ title, value, sub, flag, theme }: any) {
  return (
    <div className={`p-6 rounded-2xl border ${theme.card} ${theme.border}`}>
      <h4 className={`text-xs font-bold mb-2 ${theme.textMuted}`}>{title}</h4>
      <div className="flex items-center gap-2">
        {flag && (
          <img
            src={`https://flagcdn.com/w40/${String(sub).toLowerCase()}.png`}
            alt="flag"
            className="w-6 h-4 rounded-sm shadow-sm object-cover"
          />
        )}
        <div className={`text-lg font-bold truncate ${theme.text}`}>
          {value}
        </div>
      </div>
      <div className={`text-xs font-mono mt-1 opacity-60 ${theme.text}`}>
        {sub}
      </div>
    </div>
  );
}
