"use client";

import { useRef } from "react";
import { useDropzone, type DropEvent, type DropzoneOptions, type FileRejection } from "react-dropzone";
import { FileTransferRows, useFileTransfer } from "../components/ui/FileTransfer";

export function useTransferDropzone({ onDrop, onDropAccepted, onDropRejected, ...options }: DropzoneOptions) {
  const transfer = useFileTransfer({ multiple: options.multiple !== false && options.maxFiles !== 1 });
  const selection = useRef<{ event: DropEvent; rejected: FileRejection[] } | null>(null);
  const dropzone = useDropzone({
    ...options,
    onDrop(accepted, rejected, event) {
      selection.current = { event, rejected };
      transfer.stage(accepted, rejected.map(item => item.file));
      if (rejected.length) onDropRejected?.(rejected, event);
    },
  });
  const fileQueue = <FileTransferRows transfer={transfer} disabled={options.disabled} onReady={ready => {
    const current = selection.current;
    if (!current) return;
    const files = ready.map(item => item.file);
    onDrop?.(files, current.rejected, current.event);
    onDropAccepted?.(files, current.event);
  }} />;
  return { ...dropzone, fileQueue };
}
