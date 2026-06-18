// components/tools/developer/code-editor/hooks/useFileSystem.ts
"use client";

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

const generateId = () => Math.random().toString(36).substring(2, 11);

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

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedFiles: VirtualFile[] = JSON.parse(saved);
        setFiles(parsedFiles);
        const folderIds = new Set<string>();
        parsedFiles.forEach((f) => {
          if (f.isFolder) folderIds.add(f.id);
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
    // Only save virtual files (not disk files)
    const virtualFiles = files.filter((f) => !f.fileHandle);
    if (virtualFiles.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(virtualFiles));
    }
    setHasUnsavedChanges(false);
    window.dispatchEvent(new CustomEvent("files-saved"));
  }, [files]);

  const activeFile = files.find((f) => f.id === activeFileId) || null;

  const openFolder = useCallback(async () => {
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
      setDirectoryHandle(handle);
      const loadedFiles: VirtualFile[] = [];

      const readDirectory = async (
        dirHandle: FileSystemDirectoryHandle,
        parentId: string | null = null,
      ) => {
        for await (const entry of (dirHandle as any).values()) {
          if (entry.kind === "file") {
            try {
              const fileHandle = entry as FileSystemFileHandle;
              const file = await fileHandle.getFile();

              if (file.size > MAX_FILE_SIZE) {
                console.warn(
                  `Skipping large file: ${entry.name} (${file.size} bytes)`,
                );
                continue;
              }

              const content = await file.text();
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
      setFiles(loadedFiles);

      if (loadedFiles.length > 0) {
        const firstFile = loadedFiles.find((f) => !f.isFolder);
        if (firstFile) setActiveFileId(firstFile.id);
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
          const writable = await fileHandle.createWritable();
          await writable.write(file.content);
          await writable.close();
          setHasUnsavedChanges(false);
          window.dispatchEvent(new CustomEvent("files-saved"));
          return;
        } catch (error) {
          console.error("Failed to write to file handle:", error);
        }
      }
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    },
    [files],
  );

  const saveAllToDisk = useCallback(async () => {
    if (!directoryHandle) {
      const data = JSON.stringify(files, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const savePromises = files
      .filter((f) => !f.isFolder)
      .map(async (file) => {
        const handle = fileHandleMapRef.current.get(file.id);
        if (handle) {
          try {
            const writable = await handle.createWritable();
            await writable.write(file.content);
            await writable.close();
            return true;
          } catch (error) {
            return false;
          }
        }
        return false;
      });
    await Promise.all(savePromises);
    setHasUnsavedChanges(false);
    window.dispatchEvent(new CustomEvent("files-saved"));
  }, [files, directoryHandle]);

  const createFileInFolder = useCallback(
    async (name: string, language: string, parentId: string | null) => {
      if (!directoryHandle) {
        createItem(name, language, parentId, false);
        return;
      }
      try {
        const parentFile = parentId
          ? files.find((f) => f.id === parentId)
          : null;
        const parentHandle = parentFile?.dirHandle || directoryHandle;
        const fileHandle = await (parentHandle as any).getFileHandle(name, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write("");
        await writable.close();

        const newFile: VirtualFile = {
          id: generateId(),
          name,
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
        createItem(name, language, parentId, false);
      }
    },
    [files, directoryHandle],
  );

  const createFolderInFolder = useCallback(
    async (name: string, parentId: string | null) => {
      if (!directoryHandle) {
        createItem(name, "folder", parentId, true);
        return;
      }
      try {
        const parentFile = parentId
          ? files.find((f) => f.id === parentId)
          : null;
        const parentHandle = parentFile?.dirHandle || directoryHandle;
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
        createItem(name, "folder", parentId, true);
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
      let finalName = name;
      if (!isFolder && !name.includes(".")) {
        const ext =
          SUPPORTED_LANGUAGES[language as SupportedLanguage]?.ext || ".txt";
        finalName = name + ext;
      }
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
      setFiles((prev) => {
        const updated = [...prev, newFile];
        const virtualFiles = updated.filter((f) => !f.fileHandle);
        if (virtualFiles.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(virtualFiles));
        }
        return updated;
      });
      if (parentId) setExpandedFolders((prev) => new Set([...prev, parentId]));
      if (!isFolder) {
        setTabs((prev) => [...prev, { fileId: newFile.id, isDirty: false }]);
        setActiveFileId(newFile.id);
      }
      setIsCreating(null);
    },
    [],
  );

  const deleteItem = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const idsToDelete = new Set<string>();
        const collectIds = (id: string) => {
          idsToDelete.add(id);
          prev
            .filter((f) => f.parentId === id)
            .forEach((f) => collectIds(f.id));
        };
        collectIds(fileId);
        const updated = prev.filter((f) => !idsToDelete.has(f.id));
        const virtualFiles = updated.filter((f) => !f.fileHandle);
        if (virtualFiles.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(virtualFiles));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        return updated;
      });
      setTabs((prev) => {
        const remaining = prev.filter((t) => t.fileId !== fileId);
        if (activeFileId === fileId) {
          setActiveFileId(
            remaining.length > 0
              ? remaining[remaining.length - 1].fileId
              : null,
          );
        }
        return remaining;
      });
    },
    [activeFileId],
  );

  const renameItem = useCallback((fileId: string, newName: string) => {
    setFiles((prev) => {
      const updated = prev.map((f) =>
        f.id === fileId
          ? { ...f, name: newName, updatedAt: new Date().toISOString() }
          : f,
      );
      const virtualFiles = updated.filter((f) => !f.fileHandle);
      if (virtualFiles.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(virtualFiles));
      }
      return updated;
    });
    setIsRenaming(null);
  }, []);

  const moveItem = useCallback((fileId: string, newParentId: string | null) => {
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
      const virtualFiles = updated.filter((f) => !f.fileHandle);
      if (virtualFiles.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(virtualFiles));
      }
      return updated;
    });
    if (newParentId)
      setExpandedFolders((prev) => new Set([...prev, newParentId]));
  }, []);

  const updateContent = useCallback((fileId: string, content: string) => {
    setHasUnsavedChanges(true);
    setTabs((prev) =>
      prev.map((t) => (t.fileId === fileId ? { ...t, isDirty: true } : t)),
    );
    setFiles((prev) => {
      const updated = prev.map((f) =>
        f.id === fileId
          ? { ...f, content, updatedAt: new Date().toISOString() }
          : f,
      );
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        const virtualFiles = updated.filter((f) => !f.fileHandle);
        if (virtualFiles.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(virtualFiles));
        }
        setHasUnsavedChanges(false);
        setTabs((prev2) =>
          prev2.map((t) => (t.fileId === fileId ? { ...t, isDirty: false } : t)),
        );
        window.dispatchEvent(new CustomEvent("files-saved"));
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
        return [...prev, { fileId, isDirty: false }];
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
        const ext = "." + (file.name.split(".").pop() || "txt");
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
    const data = JSON.stringify(files, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-${Date.now()}.json`;
    a.click();
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
      a.download = file.name;
      a.click();
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
      let zipContent = `# ${folder.name}\n\nDownloaded from Tools Manager\nDate: ${new Date().toISOString()}\n\n## Files:\n\n`;
      folderFiles.forEach((f) => {
        zipContent += `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\`\n\n`;
      });
      const blob = new Blob([zipContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folder.name}.md`;
      a.click();
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
