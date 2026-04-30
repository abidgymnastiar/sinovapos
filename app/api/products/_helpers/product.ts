import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PRODUCT_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "products",
);
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PRODUCT_IMAGE_ERROR_MESSAGES = [
  "Image harus JPG, PNG, atau WEBP",
  "Ukuran image maksimal 2MB",
];

export type ProductPayload = {
  image?: string;
  name?: string;
};

export function toJSON<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

export function isProductImageValidationError(error: unknown): error is Error {
  return (
    error instanceof Error && PRODUCT_IMAGE_ERROR_MESSAGES.includes(error.message)
  );
}

function getImageExtension(file: File) {
  const mimeExtension = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  }[file.type];

  if (mimeExtension) {
    return mimeExtension;
  }

  return path.extname(file.name).toLowerCase();
}

function isContentType(req: Request, contentType: string) {
  return req.headers.get("content-type")?.includes(contentType) ?? false;
}

async function saveProductImage(file: File) {
  if (file.size === 0) {
    return undefined;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Image harus JPG, PNG, atau WEBP");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ukuran image maksimal 2MB");
  }

  await mkdir(PRODUCT_UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}${getImageExtension(file)}`;
  const filepath = path.join(PRODUCT_UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);

  return `/uploads/products/${filename}`;
}

export async function parseProductPayload(req: Request): Promise<ProductPayload> {
  if (isContentType(req, "multipart/form-data")) {
    const formData = await req.formData();
    const name = formData.get("name");
    const image = formData.get("image");

    return {
      image: image instanceof File ? await saveProductImage(image) : undefined,
      name: typeof name === "string" ? name : undefined,
    };
  }

  const body: { name?: string; image?: string } = await req.json();

  return {
    image: body.image,
    name: body.name,
  };
}
