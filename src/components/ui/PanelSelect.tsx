"use client";

import { Children, Fragment, isValidElement, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import PanelDropdown, { type PanelOption } from "./PanelDropdown";

function textContent(node: ReactNode): string {
  return Children.toArray(node).map(child => isValidElement<{ children?: ReactNode }>(child) ? textContent(child.props.children) : String(child)).join("");
}
function getOptions(children: ReactNode, group?: string, disabled = false): PanelOption[] {
  return Children.toArray(children).flatMap(child => {
    if (!isValidElement<{ children?: ReactNode; value?: string | number; label?: string; disabled?: boolean }>(child)) return [];
    if (child.type === Fragment) return getOptions(child.props.children, group, disabled);
    if (child.type === "optgroup") return getOptions(child.props.children, child.props.label, disabled || !!child.props.disabled);
    if (child.type !== "option") return [];
    const label = child.props.label ?? textContent(child.props.children);
    return [{ value: String(child.props.value ?? label), label, group, disabled: disabled || child.props.disabled }];
  });
}

/** Retains a real select for refs, form values, native validation and React change events. */
export default function PanelSelect({ className, style, id: explicitId, ref, children, ...props }: ComponentProps<"select">) {
  const autoId = useId(), id = explicitId ?? `panel-select-${autoId}`;
  const options = getOptions(children);
  const native = useRef<HTMLSelectElement>(null);
  const [uncontrolled, setUncontrolled] = useState(props.defaultValue ?? (props.multiple ? [] : options.find(option => !option.disabled)?.value ?? ""));
  const value = props.value ?? uncontrolled;
  useEffect(() => {
    const form = native.current?.form;
    const reset = () => { requestAnimationFrame(() => { if (props.value === undefined && native.current) setUncontrolled(props.multiple ? [...native.current.selectedOptions].map(option => option.value) : native.current.value); }); };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [props.multiple, props.value]);
  const choose = (value: string) => {
    const element = native.current;
    if (!element || element.matches(":disabled")) return;
    if (props.multiple) {
      const option = [...element.options].find(option => option.value === value);
      if (option) option.selected = !option.selected;
    } else element.value = value;
    if (props.value === undefined) setUncontrolled(props.multiple ? [...element.selectedOptions].map(option => option.value) : value);
    element.dispatchEvent(new Event("change", { bubbles: true }));
  };
  return <>
    <select {...props} ref={element => { native.current = element; if (typeof ref === "function") ref(element); else if (ref) ref.current = element; }} id={`${id}-native`} className="panel-native-select" tabIndex={-1} aria-hidden="true" onInvalid={event => { props.onInvalid?.(event); event.preventDefault(); document.getElementById(id)?.focus(); }}>
      {children}
    </select>
    <PanelDropdown id={id} options={options} value={Array.isArray(value) ? value.map(String) : String(value)} onChange={choose} className={className} style={style} disabled={props.disabled} multiple={props.multiple} label={props["aria-label"]} labelledBy={props["aria-labelledby"]} describedBy={props["aria-describedby"]} invalid={props["aria-invalid"] === true || props["aria-invalid"] === "true"} searchable={options.length > 8} />
  </>;
}
