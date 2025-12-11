declare module "imagetracerjs" {
  // اگر فقط همین یکی را لازم داری، همین حد کفایت می‌کند
  export interface ImageTracerOptions {
    ltres?: number;
    qtres?: number;
    numberofcolors?: number;
    blurradius?: number;
    // در صورت نیاز بقیهٔ optionها را هم اضافه کن
  }

  interface ImageTracerStatic {
    imagedataToSVG(
      imageData: ImageData,
      options?: ImageTracerOptions | string
    ): string;
  }

  const ImageTracer: ImageTracerStatic;
  export default ImageTracer;
}
