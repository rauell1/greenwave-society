import "server-only";
import { getDb } from "../db";
import { AdminUserDto } from "../auth/types";

/**
 * Gets the complete AdminUserDto by user ID.
 */
export async function getAdminUserById(userId: string): Promise<AdminUserDto | null> {
  const db = getDb();
  const user = await db.adminUser.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const roleNames = user.roles.map((ur) => ur.role.name);
  
  // Collect unique permissions
  const permissionsSet = new Set<string>();
  for (const ur of user.roles) {
    for (const rp of ur.role.permissions) {
      permissionsSet.add(rp.permission.key);
    }
  }

  return {
    id: user.id,
    email: user.email,
    isActive: user.isActive,
    roles: roleNames,
    permissions: Array.from(permissionsSet),
  };
}

/**
 * Legacy support for retrieving an admin by email for old sessions
 */
export async function getAdminUserByEmail(email: string): Promise<AdminUserDto | null> {
  const db = getDb();
  const user = await db.adminUser.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const roleNames = user.roles.map((ur) => ur.role.name);
  
  const permissionsSet = new Set<string>();
  for (const ur of user.roles) {
    for (const rp of ur.role.permissions) {
      permissionsSet.add(rp.permission.key);
    }
  }

  return {
    id: user.id,
    email: user.email,
    isActive: user.isActive,
    roles: roleNames,
    permissions: Array.from(permissionsSet),
  };
}
