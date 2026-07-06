export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  stats: {
    dashboard: ["stats", "dashboard"] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params: any) => ["orders", "list", params] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  restaurants: {
    all: ["restaurants"] as const,
    list: (params: any) => ["restaurants", "list", params] as const,
    detail: (id: string) => ["restaurants", "detail", id] as const,
  },
  drivers: {
    all: ["drivers"] as const,
    list: (params: any) => ["drivers", "list", params] as const,
    detail: (id: string) => ["drivers", "detail", id] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: any) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  ledger: {
    all: ["ledger"] as const,
    list: (params: any) => ["ledger", "list", params] as const,
  },
  config: {
    all: ["config"] as const,
  },
} as const;