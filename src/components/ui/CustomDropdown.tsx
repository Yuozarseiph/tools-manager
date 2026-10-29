"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import PanelDropdown, { type PanelOption } from "./PanelDropdown";

interface CustomDropdownProps {
  options: PanelOption[] | string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  labelIcon?: LucideIcon;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function CustomDropdown({ options, label, labelIcon: LabelIcon, className = "", ...props }: CustomDropdownProps) {
  const id = useId();
  return <div className={`min-w-0 ${className}`}><PanelDropdown {...props} id={`dropdown-${id}`} label={label} options={options.map(option => typeof option === "string" ? { value: option, label: option } : option)} searchable={props.searchable ?? true} labelContent={label && <label htmlFor={`dropdown-${id}`} className="panel-control-label">{LabelIcon && <LabelIcon className="h-4 w-4" aria-hidden="true" />}{label}</label>} /></div>;
}
