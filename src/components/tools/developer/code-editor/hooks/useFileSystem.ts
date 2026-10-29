// components/tools/developer/code-editor/hooks/useFileSystem.ts
"use client";
import { saveFile } from "@/lib/file-export";
import { outputFilename } from "@/lib/output-name";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  VirtualFile,
  EditorTab,
  STORAGE_KEY,
  AUTO_SAVE_DELAY,
  MAX_FILE_SIZE,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "../types";

const generateId = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).substring(2, 11);

const persistVirtualFiles = (files: VirtualFile[]) => {
  try {
    const virtual = files.filter((f) => !f.fileHandle && !f.dirHandle);
    if (virtual.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(virtual));
    else localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Unable to save editor workspace", error);
    return false;
  }
};

const validItemName = (name: string) => !!name.trim() && name !== "." && name !== ".." && !/[\\/]/.test(name);

const isFileSystemSupported = () => {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
};

export function useFileSystem() {
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [isCreating, setIsCreating] = useState<{
    type: "file" | "folder";
    parentId: string | null;
  } | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [directoryHandle, setDirectoryHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialized = useRef(false);
  const fileHandleMapRef = useRef<Map<string, FileSystemFileHandle>>(new Map());
  const dirtyIdsRef = useRef<Set<string>>(new Set());
  const revisionsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedFiles: VirtualFile[] = JSON.parse(saved);
        if (!Array.isArray(parsedFiles) || !parsedFiles.every((f) => f && typeof f.id === "string" && typeof f.name === "string" && typeof f.content === "string")) throw new Error("Invalid editor workspace data");
        setFiles(parsedFiles);
        // Do not expand thousands of nested directories on initial load.
        const folderIds = new Set<string>();
        parsedFiles.forEach((f) => {
          if (f.isFolder && f.parentId === null) folderIds.add(f.id);
        });
        setExpandedFolders(folderIds);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const saved = persistVirtualFiles(files);
    if (saved) {
      for (const file of files) if (!file.fileHandle) dirtyIdsRef.current.delete(file.id);
      setTabs((prev) => prev.map((tab) => ({ ...tab, isDirty: dirtyIdsRef.current.has(tab.fileId) })));
      setHasUnsavedChanges(dirtyIdsRef.current.size > 0);
      window.dispatchEvent(new CustomEvent("files-saved"));
    } else {
      alert("Unable to save workspace. Browser storage may be full. Download your files before leaving.");
    }
    const handle = activeFileId ? fileHandleMapRef.current.get(activeFileId) : null;
    if (handle && activeFileId) {
      const current = files.find((f) => f.id === activeFileId);
      if (current && dirtyIdsRef.current.has(activeFileId)) {
        const revision = revisionsRef.current.get(current.id) ?? 0;
        void (async () => {
          try {
            const writable = await handle.createWritable();
            await writable.write(current.content);
            await writable.close();
            if (revisionsRef.current.get(current.id) === revision) dirtyIdsRef.current.delete(current.id);
            setTabs((prev) => prev.map((t) => t.fileId === current.id ? { ...t, isDirty: dirtyIdsRef.current.has(current.id) } : t));
            setHasUnsavedChanges(dirtyIdsRef.current.size > 0);
          } catch (error) {
            console.error("Save to disk failed", error);
            alert("Could not save the file to disk. Check file permissions.");
          }
        })();
      }
    }
  }, [files, activeFileId]);

  const activeFile = files.find((f) => f.id === activeFileId) || null;

  const openFolder = useCallback(async () => {
    if (dirtyIdsRef.current.size && !window.confirm("You have unsaved changes. Replace the current workspace?")) return;
    if (!isFileSystemSupported()) {
      alert(
        "Your browser doesn't support the File System API. Try Chrome or Edge.",
      );
      return;
    }
    try {
      const handle = await (window as any).showDirectoryPicker({
        mode: "readwrite",
      });
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setDirectoryHandle(handle);
      fileHandleMapRef.current.clear();
      const loadedFiles: VirtualFile[] = [];
      let bytesLoaded = 0;
      let capped = false;

      const readDirectory = async (
        dirHandle: FileSystemDirectoryHandle,
        parentId: string | null = null,
      ) => {
        for await (const entry of (dirHandle as any).values()) {
          if (loadedFiles.length >= 1000 || bytesLoaded >= 32 * 1024 * 1024) {capped = true;break;}
          if (entry.kind === "file") {
            try {
              const fileHandle = entry as FileSystemFileHandle;
              const file = await fileHandle.getFile();

              if (file.size > MAX_FILE_SIZE || file.size + bytesLoaded > 32 * 1024 * 1024 || /\.(png|jpg|jpeg|gif|webp|avif|ico|svgz|woff2?|ttf|eot|mp[34]|zip|pdf|exe|dll|wasm|bin|sqlite|lock)$/i.test(entry.name)) {
                console.warn(
                  `Skipping large file: ${entry.name} (${file.size} bytes)`,
                );
                continue;
              }

              const content = await file.text();
              bytesLoaded += file.size;
              const ext =
                "." + (entry.name.split(".").pop()?.toLowerCase() || "txt");

              let language = "plaintext";
              if (ext === ".js") language = "javascript";
              else if (ext === ".jsx") language = "jsx";
              else if (ext === ".ts") language = "typescript";
              else if (ext === ".tsx") language = "tsx";
              else if (ext === ".html" || ext === ".htm") language = "html";
              else if (ext === ".css") language = "css";
              else if (ext === ".scss") language = "scss";
              else if (ext === ".json") language = "json";
              else if (ext === ".md") language = "markdown";
              else if (ext === ".py") language = "python";
              else if (ext === ".php") language = "php";
              else if (ext === ".java") language = "java";
              else if (ext === ".cpp" || ext === ".cc") language = "cpp";
              else if (ext === ".c" || ext === ".h") language = "c";
              else if (ext === ".cs") language = "csharp";
              else if (ext === ".go") language = "go";
              else if (ext === ".rs") language = "rust";
              else if (ext === ".sql") language = "sql";
              else if (ext === ".xml") language = "xml";
              else if (ext === ".yml" || ext === ".yaml") language = "yaml";
              else if (ext === ".sh" || ext === ".bash") language = "shell";
              else if (entry.name.toLowerCase() === "dockerfile")
                language = "dockerfile";

              const newFile: VirtualFile = {
                id: generateId(),
                name: entry.name,
                language,
                content,
                parentId,
                isFolder: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                fileHandle: fileHandle as any,
              };
              loadedFiles.push(newFile);
              fileHandleMapRef.current.set(newFile.id, fileHandle);
            } catch (error) {
              console.error(`Error reading file ${entry.name}:`, error);
            }
          } else if (entry.kind === "directory") {
            if (["node_modules", ".git", ".next", "dist", "build", ".cache"].includes(entry.name)) continue;
            const folderId = generateId();
            const folderHandle = entry as FileSystemDirectoryHandle;
            loadedFiles.push({
              id: folderId,
              name: entry.name,
              language: "folder",
              content: "",
              parentId,
              isFolder: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              dirHandle: folderHandle as any,
            });
            await readDirectory(folderHandle, folderId);
          }
        }
      };

      await readDirectory(handle);
      if (capped) alert("Large folder: only the first 1,000 entries / 32MB of text were loaded. Other files remain untouched.");
      setFiles(loadedFiles);
      revisionsRef.current.clear();
      dirtyIdsRef.current.clear();
      setHasUnsavedChanges(false);
      setTabs([]);
      // Show a compact project tree, expanding just the ancestors of the active file.
      const first = loadedFiles.find((f) => !f.isFolder);
      const expanded = new Set<string>();
      let folderId = first?.parentId;
      const seen = new Set<string>();
      while (folderId && !seen.has(folderId)) {
        seen.add(folderId);
        expanded.add(folderId);
        folderId = loadedFiles.find((f) => f.id === folderId)?.parentId ?? null;
      }
      setExpandedFolders(expanded);
      setActiveFileId(null);

      if (loadedFiles.length > 0) {
        const firstFile = loadedFiles.find((f) => !f.isFolder);
        if (firstFile) {setActiveFileId(firstFile.id); setTabs([{fileId: firstFile.id, isDirty: false}]);}
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Failed to open folder:", error);
      }
    }
  }, []);

  const saveToDisk = useCallback(
    async (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (!file || file.isFolder) return;
      const fileHandle = fileHandleMapRef.current.get(fileId);
      if (fileHandle) {
        try {
          const revision = revisionsRef.current.get(fileId) ?? 0;
          const writable = await fileHandle.createWritable();
          await writable.write(file.content);
          await writable.close();
          if (revisionsRef.current.get(fileId) === revision) dirtyIdsRef.current.delete(fileId);
          setTabs((prev) => prev.map((tab) => tab.fileId === fileId ? {...tab, isDirty: dirtyIdsRef.current.has(fileId)} : tab));
          setHasUnsavedChanges(dirtyIdsRef.current.size > 0);
          window.dispatchEvent(new CustomEvent("files-saved"));
          return;
        } catch (error) {
          console.error("Failed to write to file handle:", error);
          alert("Could not save to disk. The file was not marked as saved.");
          return;
        }
      }
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputFilename(file.name);
      void saveFile(a.href, a.download);
      URL.revokeObjectURL(url);
    },
    [files],
  );

  const saveAllToDisk = useCallback(async () => {
    if (!directoryHandle) {
      const data = JSON.stringify(files.map(({ fileHandle, dirHandle, ...rest }) => rest), null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputFilename(`project-${Date.now()}.json`);
      void saveFile(a.href, a.download);
      URL.revokeObjectURL(url);
      return;
    }
    const diskFiles = files.filter((f) => !f.isFolder && fileHandleMapRef.current.has(f.id));
    const savePromises = diskFiles.map(async (file) => {
        const revision = revisionsRef.current.get(file.id) ?? 0;
        const handle = fileHandleMapRef.current.get(file.id);
        if (handle) {
          try {
            const writable = await handle.createWritable();
            await writable.write(file.content);
            await writable.close();
            return revision === (revisionsRef.current.get(file.id) ?? 0);
          } catch (error) {
            return false;
          }
        }
        return false;
      });
    const results = await Promise.all(savePromises);
    diskFiles.forEach((f, index) => {
      if (results[index]) dirtyIdsRef.current.delete(f.id);
    });
    setTabs((prev) => prev.map((t) => ({ ...t, isDirty: dirtyIdsRef.current.has(t.fileId) })));
    setHasUnsavedChanges(dirtyIdsRef.current.size > 0);
    if (results.some((ok) => !ok)) alert("Some files could not be saved. Check disk permissions.");
    else window.dispatchEvent(new CustomEvent("files-saved"));
  }, [files, directoryHandle]);

  const createFileInFolder = useCallback(
    async (name: string, language: string, parentId: string | null) => {
      if (!validItemName(name)) {alert("Invalid file name.");return;}
      if (!directoryHandle) {
        createItem(name, language, parentId, false);
        return;
      }
      const finalName = name.includes(".") ? name : name + (SUPPORTED_LANGUAGES[language as SupportedLanguage]?.ext || ".txt");
      if (files.some((f) => f.parentId === parentId && f.name.toLowerCase() === finalName.toLowerCase())) {alert("A file with this name already exists.");return;}
      try {
        const parentFile = parentId ? files.find((f) => f.id === parentId) : null;
        const parentHandle = parentFile?.dirHandle || directoryHandle;
        try {
          await (parentHandle as FileSystemDirectoryHandle).getFileHandle(finalName);
          alert("The file already exists on disk. Open it instead of overwriting it.");
          return;
        } catch (error) {
          if ((error as DOMException).name !== "NotFoundError") throw error;
        }
        const fileHandle = await (parentHandle as any).getFileHandle(finalName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write("");
        await writable.close();

        const newFile: VirtualFile = {
          id: generateId(),
          name: finalName,
          language,
          content: "",
          parentId,
          isFolder: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          fileHandle,
        };
        setFiles((prev) => [...prev, newFile]);
        fileHandleMapRef.current.set(newFile.id, fileHandle);
        setTabs((prev) => [...prev, { fileId: newFile.id, isDirty: false }]);
        setActiveFileId(newFile.id);
        setIsCreating(null);
      } catch (error) {
        console.error("Cannot create disk file",error);
        alert("Cannot create this file on disk. Check permissions.");
      }
    },
    [files, directoryHandle],
  );

  const createFolderInFolder = useCallback(
    async (name: string, parentId: string | null) => {
      if (!validItemName(name)) {alert("Invalid folder name.");return;}
      if (!directoryHandle) {
        createItem(name, "folder", parentId, true);
        return;
      }
      if (files.some((f) => f.parentId === parentId && f.name.toLowerCase() === name.toLowerCase())) {alert("A folder with this name already exists.");return;}
      try {
        const parentFile = parentId ? files.find((f) => f.id === parentId) : null;
        const parentHandle = parentFile?.dirHandle || directoryHandle;
        try {
          await (parentHandle as FileSystemDirectoryHandle).getDirectoryHandle(name);
          alert("This folder already exists on disk.");
          return;
        } catch (error) {
          if ((error as DOMException).name !== "NotFoundError") throw error;
        }
        const dirHandle = await (parentHandle as any).getDirectoryHandle(name, {
          create: true,
        });

        const newFolder: VirtualFile = {
          id: generateId(),
          name,
          language: "folder",
          content: "",
          parentId,
          isFolder: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dirHandle,
        };
        setFiles((prev) => [...prev, newFolder]);
        if (parentId)
          setExpandedFolders((prev) => new Set([...prev, parentId]));
        setIsCreating(null);
      } catch (error) {
        console.error("Cannot create disk folder",error);
        alert("Cannot create this folder on disk. Check permissions.");
      }
    },
    [files, directoryHandle],
  );

  const createItem = useCallback(
    (
      name: string,
      language: string,
      parentId: string | null,
      isFolder: boolean,
    ) => {
      if (!validItemName(name)) { alert("Invalid file or folder name."); return; }
      let finalName = name;
      if (!isFolder && !name.includes(".")) {
        const ext =
          SUPPORTED_LANGUAGES[language as SupportedLanguage]?.ext || ".txt";
        finalName = name + ext;
      }
      if (files.some((f) => f.parentId === parentId && f.name.toLowerCase() === finalName.toLowerCase())) {alert("A file or folder with that name already exists.");return;}
      const newFile: VirtualFile = {
        id: generateId(),
        name: finalName,
        language: isFolder ? "folder" : language,
        content: "",
        parentId,
        isFolder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setFiles((prev) => {
        const updated = [...prev, newFile];
        persistVirtualFiles(updated);
        return updated;
      });
      if (parentId) setExpandedFolders((prev) => new Set([...prev, parentId]));
      if (!isFolder) {
        setTabs((prev) => [...prev, { fileId: newFile.id, isDirty: false }]);
        setActiveFileId(newFile.id);
      }
      setIsCreating(null);
    },
    [files],
  );

  const deleteItem = useCallback((fileId: string) => {
    const ids = new Set<string>();
    const collect = (id: string) => {
      ids.add(id);
      files.filter((f) => f.parentId === id).forEach((f) => collect(f.id));
    };
    collect(fileId);
    if ([...ids].some((id) => dirtyIdsRef.current.has(id)) &&
        !window.confirm("These files have unsaved changes. Remove them from the editor?")) return;
    if ([...ids].some((id) => fileHandleMapRef.current.has(id) || files.find((f) => f.id === id)?.dirHandle) &&
        !window.confirm("Remove from editor? The original files on disk will not be deleted.")) return;
    setFiles((prev) => {
      const updated = prev.filter((f) => !ids.has(f.id));
      persistVirtualFiles(updated);
      return updated;
    });
    ids.forEach((id) => {dirtyIdsRef.current.delete(id);fileHandleMapRef.current.delete(id);revisionsRef.current.delete(id)});
    setHasUnsavedChanges(dirtyIdsRef.current.size > 0);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const remaining = tabs.filter((t) => !ids.has(t.fileId));
    setTabs(remaining);
    if (activeFileId && ids.has(activeFileId)) setActiveFileId(remaining.at(-1)?.fileId ?? null);
  }, [files, tabs, activeFileId]);

  const renameItem = useCallback((fileId: string, newName: string) => {
    const item = files.find((f) => f.id === fileId);
    if (!item || !validItemName(newName)) return;
    if (item.fileHandle || item.dirHandle) {alert("Renaming disk-backed files is not available in this browser editor.");setIsRenaming(null);return;}
    if (files.some((f) => f.id !== fileId && f.parentId === item.parentId && f.name.toLowerCase() === newName.toLowerCase())) {alert("A file with that name already exists.");return;}
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setFiles((prev) => {
      const updated = prev.map((f) => f.id === fileId ? { ...f, name: newName, updatedAt: new Date().toISOString() } : f);
      persistVirtualFiles(updated);
      return updated;
    });
    setIsRenaming(null);
  }, [files]);

  const moveItem = useCallback((fileId: string, newParentId: string | null) => {
    const item = files.find((f) => f.id === fileId);
    if (item?.fileHandle || item?.dirHandle || (newParentId && files.find((f) => f.id === newParentId)?.dirHandle)) {alert("Moving files inside disk-backed folders is not supported here.");return;}
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setFiles((prev) => {
      if (fileId === newParentId) return prev;
      const idsToCheck = new Set<string>();
      const collectIds = (id: string) => {
        idsToCheck.add(id);
        prev.filter((f) => f.parentId === id).forEach((f) => collectIds(f.id));
      };
      collectIds(fileId);
      if (newParentId && idsToCheck.has(newParentId)) return prev;
      const updated = prev.map((f) =>
        f.id === fileId
          ? { ...f, parentId: newParentId, updatedAt: new Date().toISOString() }
          : f,
      );
      persistVirtualFiles(updated);
      return updated;
    });
    if (newParentId)
      setExpandedFolders((prev) => new Set([...prev, newParentId]));
  }, [files]);

  const updateContent = useCallback((fileId: string, content: string) => {
    dirtyIdsRef.current.add(fileId);
    revisionsRef.current.set(fileId, (revisionsRef.current.get(fileId) ?? 0) + 1);
    setHasUnsavedChanges(true);
    setTabs((prev) => prev.map((t) => t.fileId === fileId ? { ...t, isDirty: true } : t));
    setFiles((prev) => {
      const updated = prev.map((f) => f.id === fileId ? { ...f, content, updatedAt: new Date().toISOString() } : f);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        const saved = persistVirtualFiles(updated);
        if (saved) {
          for (const file of updated) if (!file.fileHandle) dirtyIdsRef.current.delete(file.id);
          setHasUnsavedChanges(dirtyIdsRef.current.size > 0);
          setTabs((open) => open.map((t) => ({ ...t, isDirty: dirtyIdsRef.current.has(t.fileId) })));
          window.dispatchEvent(new CustomEvent("files-saved"));
        } else {
          setHasUnsavedChanges(true);
        }
      }, AUTO_SAVE_DELAY);
      return updated;
    });
  }, []);

  const openTab = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (!file || file.isFolder) return;
      setActiveFileId(fileId);
      setTabs((prev) => {
        if (prev.find((t) => t.fileId === fileId)) return prev;
        return [...prev, { fileId, isDirty: dirtyIdsRef.current.has(fileId) }];
      });
    },
    [files],
  );

  const closeTab = useCallback(
    (fileId: string) => {
      setTabs((prev) => {
        const updated = prev.filter((t) => t.fileId !== fileId);
        if (activeFileId === fileId) {
          setActiveFileId(
            updated.length > 0 ? updated[updated.length - 1].fileId : null,
          );
        }
        return updated;
      });
    },
    [activeFileId],
  );

  const importFile = useCallback(
    (file: File, parentId: string | null = null) => {
      if (file.size > MAX_FILE_SIZE) {
        alert("File too large! Max 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const ext = "." + (file.name.split(".").pop() || "txt").toLowerCase();
        let language = "plaintext";
        Object.entries(SUPPORTED_LANGUAGES).forEach(([key, val]) => {
          if (val.ext === ext) language = key;
        });
        const newFile: VirtualFile = {
          id: generateId(),
          name: file.name,
          language,
          content,
          parentId,
          isFolder: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setFiles((prev) => {
          const updated = [...prev, newFile];
          const virtualFiles = updated.filter((f) => !f.fileHandle);
          if (virtualFiles.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(virtualFiles));
          }
          return updated;
        });
        setTabs((prev) => [...prev, { fileId: newFile.id, isDirty: false }]);
        setActiveFileId(newFile.id);
        if (parentId)
          setExpandedFolders((prev) => new Set([...prev, parentId]));
      };
      reader.readAsText(file);
    },
    [],
  );

  const exportAll = useCallback(() => {
    const data = JSON.stringify(files.map(({ fileHandle, dirHandle, ...rest }) => rest), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputFilename(`project-${Date.now()}.json`);
    void saveFile(a.href, a.download);
    URL.revokeObjectURL(url);
  }, [files]);

  const exportFile = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (!file || file.isFolder) return;
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputFilename(file.name);
      void saveFile(a.href, a.download);
      URL.revokeObjectURL(url);
    },
    [files],
  );

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(folderId) ? next.delete(folderId) : next.add(folderId);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFiles([]);
    setTabs([]);
    setActiveFileId(null);
    setExpandedFolders(new Set());
    setIsCreating(null);
    setIsRenaming(null);
    setDirectoryHandle(null);
    dirtyIdsRef.current.clear();
    revisionsRef.current.clear();
    setHasUnsavedChanges(false);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    fileHandleMapRef.current.clear();
  }, []);

  const downloadFolder = useCallback(
    async (folderId: string) => {
      const folder = files.find((f) => f.id === folderId);
      if (!folder || !folder.isFolder) return;
      const collectFiles = (
        id: string,
        basePath: string = "",
      ): { path: string; content: string }[] => {
        const result: { path: string; content: string }[] = [];
        const children = files.filter((f) => f.parentId === id);
        children.forEach((child) => {
          const childPath = basePath ? `${basePath}/${child.name}` : child.name;
          if (child.isFolder) {
            result.push(...collectFiles(child.id, childPath));
          } else {
            result.push({ path: childPath, content: child.content });
          }
        });
        return result;
      };
      const folderFiles = collectFiles(folderId, folder.name);
      let zipContent = `# ${folder.name}\n\nDownloaded from QodeForge\nDate: ${new Date().toISOString()}\n\n## Files:\n\n`;
      folderFiles.forEach((f) => {
        zipContent += `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\`\n\n`;
      });
      const blob = new Blob([zipContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputFilename(`${folder.name}.md`);
      void saveFile(a.href, a.download);
      URL.revokeObjectURL(url);
    },
    [files],
  );

  return {
    files,
    tabs,
    activeFileId,
    activeFile,
    expandedFolders,
    isCreating,
    isRenaming,
    isLoading,
    hasUnsavedChanges,
    directoryHandle,
    createItem: directoryHandle ? createFileInFolder : createItem,
    createFolder: directoryHandle ? createFolderInFolder : createItem,
    deleteItem,
    renameItem,
    moveItem,
    updateContent,
    openTab,
    closeTab,
    importFile,
    exportAll,
    exportFile,
    downloadFolder,
    openFolder,
    saveToDisk,
    saveAllToDisk,
    toggleFolder,
    resetAll,
    forceSave,
    setIsCreating,
    setIsRenaming,
    isFileSystemSupported: isFileSystemSupported(),
  };
}

