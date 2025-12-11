"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";
import rawContent from "./image-editor.i18n.json";

type DocCategoryKey = "image";

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
}

export interface ImageEditorToolContent extends BaseDocsFields {
  id: "image-editor";
  ui: {
    topbar: {
      file: string;
      edit: string;
      layer: string;
      export: string;
      save: string;
    };
    fileMenu: {
      open: string;
      openRecent: string;
      saveProject: string;
      loadProject: string;
      newProject: string;
    };
    editMenu: {
      undo: string;
      redo: string;
      copy: string;
      paste: string;
      delete: string;
    };
    layerMenu: {
      newLayer: string;
      duplicateLayer: string;
      deleteLayer: string;
      mergeDown: string;
      flattenImage: string;
    };
    exportMenu: {
      exportAs: string;
      exportPSD: string;
      exportPNG: string;
      exportJPG: string;
      exportWebP: string;
      exportAVIF: string;
      exportSVG: string;
    };
    toolbar: {
      select: string;
      crop: string;
      resize: string;
      rotate: string;
      flip: string;
      filter: string;
      text: string;
      draw: string;
    };
    layerPanel: {
      title: string;
      opacity: string;
      blendMode: string;
      visible: string;
      locked: string;
      addLayer: string;
      deleteLayer: string;
    };
    properties: {
      title: string;
      width: string;
      height: string;
      x: string;
      y: string;
      rotation: string;
      maintainRatio: string;
    };
    filters: {
      title: string;
      brightness: string;
      contrast: string;
      saturation: string;
      hue: string;
      blur: string;
      sharpen: string;
      grayscale: string;
      sepia: string;
      apply: string;
      reset: string;
      download: string;
    };
    editorHeader: {
      upload: string;
      clear: string;
      urlPlaceholder: string;
      urlLoad: string;
      urlHint: string;
      noImageHint: string;
    };
    resizeTab: {
      title: string;
      scale: string;
      apply: string;
      download: string;
    };
    rotateTab: {
      title: string;
      rotateLeft: string;
      rotateRight: string;
      rotate180: string;
      flipH: string;
      flipV: string;
      download: string;
    };
    textTab: {
      title: string;
      content: string;
      fontFamily: string;
      fontSize: string;
      fontWeight: string;
      align: string;
      color: string;
      strokeColor: string;
      strokeWidth: string;
      shadowColor: string;
      shadowBlur: string;
      shadowOffsetX: string;
      shadowOffsetY: string;
      positionY: string;
      download: string;
    };

    text: {
      title: string;
      fontFamily: string;
      fontSize: string;
      fontWeight: string;
      color: string;
      align: string;
      addText: string;
    };
    canvas: {
      loading: string;
      noImage: string;
      dragDrop: string;
      supportedFormats: string;
      processing: string;
    };
    notifications: {
      imageSaved: string;
      projectSaved: string;
      projectLoaded: string;
      layerAdded: string;
      layerDeleted: string;
      filterApplied: string;
      error: string;
    };
    shortcuts: {
      title: string;
      undo: string;
      redo: string;
      save: string;
      copy: string;
      paste: string;
      delete: string;
    };
    blendModes: {
      normal: string;
      multiply: string;
      screen: string;
      overlay: string;
      darken: string;
      lighten: string;
      colorDodge: string;
      colorBurn: string;
      hardLight: string;
      softLight: string;
      difference: string;
      exclusion: string;
    };
  };
}

const CONTENT_BY_LOCALE = rawContent as Record<Locale, ImageEditorToolContent>;

export function useImageEditorContent(): ImageEditorToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
