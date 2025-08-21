export interface Env extends Cloudflare.Env {
  R2_BUCKET: R2Bucket;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
}
export type Variables = {
  user?: any;
  admin?: any;
  db?: ReturnType<typeof import("@/db").createDB>;
};