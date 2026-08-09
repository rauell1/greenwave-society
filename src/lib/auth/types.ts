export type AdminRole = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
};

export type AdminPermission = {
  id: string;
  key: string;
  description: string | null;
};

export type AdminUserDto = {
  id: string;
  email: string;
  isActive: boolean;
  roles: string[]; // Role names
  permissions: string[]; // Permission keys
};

export type AdminSessionDto = {
  id: string;
  userId: string | null;
  email?: string; // Fallback for old sessions
  expiresAt: Date;
  idleExpiresAt: Date | null;
};
