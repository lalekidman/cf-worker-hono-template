export type Variables = {
  user?: any;
  admin?: any;
  db?: ReturnType<typeof import("@/db").createDB>;
};