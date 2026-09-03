export const EXECUTIVE_ROLE_NAMES = [
  "Chief Executive Officer (CEO)",
  "Chief Operating Officer (COO)",
  "Chief Innovation Officer (CIO)",
  "Chief Strategy and Well-being Officer (CSWO)",
  "Head of Design",
  "Design Assistant",
  "External Communications Lead",
  "Internal Communications Assistant",
  "Partnerships Lead",
] as const;

const EXECUTIVE_ROLE_SET = new Set<string>(EXECUTIVE_ROLE_NAMES);

export function isExecutiveRoleName(roleName: string) {
  return EXECUTIVE_ROLE_SET.has(roleName);
}
