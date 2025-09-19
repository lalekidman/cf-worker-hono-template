export interface Env extends Cloudflare.Env {
}
export type Variables = {
  user?: any;
  admin?: any;
  db?: ReturnType<typeof import("@/apps/database").createDB>;
};