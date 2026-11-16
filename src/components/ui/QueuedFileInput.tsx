"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import { FileTransferRows, useFileTransfer } from "./FileTransfer";

type FileInputProps = Omit<ComponentProps<"input">, "type"> & {
  webkitdirectory?: string;
  fieldLabel?: string;
  hasVisibleLabel?: boolean;
  "data-file-target"?: string;
  skipRead?: (file: File) => boolean;
};

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const filename = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return accept.split(",").some(part => {
    const token = part.trim().toLowerCase();
    if (!token) return false;
    if (token.startsWith(".")) return filename.endsWith(token);
    if (!mime) return true; // The tool can validate formats when the browser supplies no MIME.
    return token.endsWith("/*") ? mime.startsWith(token.slice(0, -1)) : mime === token;
  });
}

/** Keep the existing input and its change contract while staging each file independently. */
export default function QueuedFileInput({ ref, onChange, multiple, accept, disabled,
  fieldLabel, hasVisibleLabel, skipRead, ...props }: FileInputProps) {
  const input = useRef<HTMLInputElement | null>(null);
  const forwarding = useRef(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const transfer = useFileTransfer({ multiple: multiple || props.webkitdirectory !== undefined, validate: file => matchesAccept(file, accept), skipRead });
  useEffect(() => {
    const element = input.current;
    if (!element) return;
    const target = element.dataset.fileTarget;
    const scope = element.closest(".ai-workspace, .tool-layout-shell, main");
    const configured = target && scope ? Array.from(scope.querySelectorAll<HTMLElement>("[data-file-target]"))
      .find(item => item !== element && item.dataset.fileTarget === target && !item.matches("input")) : undefined;
    const anchor = element.closest("label") ?? configured ?? element;
    // Existing drop surfaces already forward their drops through this input.
    const attachDrop = anchor === element || anchor.matches("label") || anchor.dataset.fileControl !== "drop";
    function allowDrop(event: DragEvent) {
      if (!element?.disabled && event.dataTransfer?.types.includes("Files")) event.preventDefault();
    }
    function drop(event: DragEvent) {
      if (!event.dataTransfer?.files.length || !element || element.disabled) return;
      event.preventDefault();
      stageDroppedFiles(element, event.dataTransfer.files);
    }
    if (attachDrop) {
      anchor.addEventListener("dragover", allowDrop);
      anchor.addEventListener("drop", drop);
    }
    const container = document.createElement("div");
    container.className = "file-transfer-host";
    anchor.after(container);
    // The host lives outside a containing label, so row controls do not reopen the picker.
    const timer = setTimeout(() => setHost(container), 0);
    return () => {
      clearTimeout(timer);
      anchor.removeEventListener("dragover", allowDrop);
      anchor.removeEventListener("drop", drop);
      container.remove();
    };
  }, []);

  return <>
    <input {...props} ref={node => {
      input.current = node;
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
    }} type="file" style={props.tabIndex === -1 ? { ...props.style, display: "none" } : props.style} accept={accept} multiple={multiple} disabled={disabled} data-file-control="input"
      data-testid="file-upload"
      aria-label={props["aria-label"] ?? (hasVisibleLabel ? undefined : fieldLabel)}
      onChange={event => {
        if (forwarding.current) { onChange?.(event); return; }
        if (event.currentTarget.files?.length) transfer.stage(event.currentTarget.files);
        event.currentTarget.value = "";
      }} />
    {host && createPortal(<div onClick={event => event.stopPropagation()}>
      <FileTransferRows transfer={transfer} disabled={disabled} onReady={files => {
        const element = input.current;
        if (!element) return;
        const list = new DataTransfer();
        files.forEach(({ file }) => list.items.add(file));
        forwarding.current = true;
        try {
          element.files = list.files;
          element.dispatchEvent(new Event("change", { bubbles: true }));
          element.value = "";
        } finally { forwarding.current = false; }
      }} />
    </div>, host)}
  </>;
}

export function stageDroppedFiles(input: HTMLInputElement | null, files: FileList) {
  if (!input || input.disabled || !files.length) return;
  input.files = files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}
