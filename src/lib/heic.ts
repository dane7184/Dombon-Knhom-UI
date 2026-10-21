export async function isHeicFile(file: File): Promise<boolean> {
  // If extension is clearly heic/heif, return true
  const name = file.name.toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif")) {
    return true;
  }

  // Check magic bytes (first 12 bytes)
  // HEIC files start with 4 bytes of length, then 'ftyp', then 'heic', 'heix', 'mif1', or 'msf1'
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);
      if (arr.length < 12) {
        resolve(false);
        return;
      }

      const ftyp = String.fromCharCode(arr[4], arr[5], arr[6], arr[7]);
      const brand = String.fromCharCode(arr[8], arr[9], arr[10], arr[11]);

      if (ftyp === "ftyp" && ["heic", "heix", "mif1", "msf1"].includes(brand)) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
}

export async function convertHeicToJpg(file: File): Promise<File> {
  // Dynamically import to avoid bloat on pages that don't need it
  const heic2any = (await import("heic2any")).default;

  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });

    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;
    const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

    return new File([blob], newName, { type: "image/jpeg" });
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    throw new Error(
      "Failed to convert HEIC image. Please try another image format.",
    );
  }
}
