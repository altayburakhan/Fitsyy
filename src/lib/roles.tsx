export type Role = 'OWNER'|'MANAGER'|'TRAINER'|'STAFF'|'MEMBER'|null

const order: Record<Exclude<Role,null>, number> = {
  OWNER: 4, MANAGER: 3, TRAINER: 2, STAFF: 1, MEMBER: 0,
}
export function hasMinRole(role: Role, min: Exclude<Role,null>) {
  if (!role) return false
  return order[role] >= order[min]
}
