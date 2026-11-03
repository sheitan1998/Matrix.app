import { base44 } from "@/api/base44Client";

/**
 * Uploads a file straight to Cloudflare R2 (S3 API) via a presigned URL
 * returned by the r2Upload backend function. Returns the public URL.
 */
export async function uploadToR2(file, folder = "cosmetics") {
  if (!file) throw new Error("Aucun fichier sélectionné");

  const res = await base44.functions.invoke("r2Upload", {
    filename: file.name,
    folder,
  });
  const data = res?.data || {};
  if (data.error) throw new Error(data.error);
  if (!data.uploadUrl || !data.publicUrl) throw new Error("URL d'upload R2 indisponible");

  const put = await fetch(data.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!put.ok) throw new Error(`Échec de l'upload R2 (${put.status})`);

  return data.publicUrl;
}