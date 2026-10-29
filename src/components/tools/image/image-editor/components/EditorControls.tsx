"use client";

import type { ReactNode } from "react";
import { AccessibleInput, AccessibleSelect, AccessibleTextarea } from "@/components/ui/AccessibleControls";
import type { ThemePalette } from "@/constants/themes";

const inputClass = (theme: ThemePalette) =>
  `w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none ${theme.border} ${theme.bg} ${theme.text} ${theme.ring}`;

export function PanelSection({
  title,
  action,
  children,
  theme,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  theme: ThemePalette;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className={`text-[11px] font-semibold uppercase tracking-wide ${theme.textMuted}`}>{title}</h4>
        {action}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  theme,
  onChange,
  suffix,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  theme: ThemePalette;
  onChange: (value: number) => void;
  suffix?: string;
  onCommit?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-medium ${theme.text}`}>{label}</span>
        <span className={`text-[11px] tabular-nums ${theme.textMuted}`}>
          {Math.round(value * 100) / 100}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <AccessibleInput
          fieldLabel={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          onPointerUp={onCommit}
          onKeyUp={onCommit}
          className="h-1.5 flex-1 cursor-pointer accent-[var(--app-accent)]"
        />
        <AccessibleInput
          fieldLabel={`${label} value`}
          numeric
          value={String(value)}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
          }}
          onBlur={onCommit}
          className={`w-16 rounded-md border px-1.5 py-1 text-[11px] tabular-nums ${theme.border} ${theme.bg} ${theme.text}`}
        />
      </div>
    </div>
  );
}

export function ColorRow({
  label,
  value,
  theme,
  onChange,
}: {
  label: string;
  value: string;
  theme: ThemePalette;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className={`text-[11px] font-medium ${theme.text}`}>{label}</span>
      <span className="flex items-center gap-2">
        <span className={`text-[11px] font-mono ${theme.textMuted}`}>{value.toUpperCase()}</span>
        <AccessibleInput
          fieldLabel={label}
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff"}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-9 cursor-pointer rounded-md border border-transparent bg-transparent p-0"
        />
      </span>
    </label>
  );
}

export function TextRow({
  label,
  value,
  theme,
  onChange,
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  theme: ThemePalette;
  onChange: (value: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={`text-[11px] font-medium ${theme.text}`}>{label}</span>
      {textarea ? (
        <AccessibleTextarea
          fieldLabel={label}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass(theme)}
        />
      ) : (
        <AccessibleInput
          fieldLabel={label}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass(theme)}
        />
      )}
    </label>
  );
}

export function NumberRow({
  label,
  value,
  theme,
  onChange,
  min,
  max,
  step = 1,
  onCommit,
}: {
  label: string;
  value: number;
  theme: ThemePalette;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  onCommit?: () => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className={`text-[11px] font-medium ${theme.text}`}>{label}</span>
      <AccessibleInput
        fieldLabel={label}
        numeric
        value={String(value)}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          onChange(Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, next)));
        }}
        onBlur={onCommit}
        step={step}
        className={`w-20 rounded-md border px-2 py-1 text-[11px] tabular-nums ${theme.border} ${theme.bg} ${theme.text}`}
      />
    </label>
  );
}

export function SelectRow<T extends string>({
  label,
  value,
  options,
  theme,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  theme: ThemePalette;
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={`text-[11px] font-medium ${theme.text}`}>{label}</span>
      <AccessibleSelect
        fieldLabel={label}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={inputClass(theme)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </AccessibleSelect>
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  theme,
  onChange,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  theme: ThemePalette;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label ? <span className={`text-[11px] font-medium ${theme.text}`}>{label}</span> : null}
      <div className={`flex overflow-hidden rounded-lg border ${theme.border}`} role="group" aria-label={label}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`flex-1 px-2 py-1.5 text-[11px] font-medium transition-colors ${
                active ? `${theme.primary}` : `${theme.bg} ${theme.text} hover:${theme.secondary}`
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MiniButton({
  children,
  theme,
  onClick,
  active,
  disabled,
  title,
  danger,
}: {
  children: ReactNode;
  theme: ThemePalette;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-[var(--app-error-border)] bg-[var(--app-error-bg)] text-[var(--app-error-text)]"
          : active
            ? `${theme.primary} border-transparent`
            : `${theme.card} ${theme.border} ${theme.text} hover:${theme.secondary}`
      }`}
    >
      {children}
    </button>
  );
}
