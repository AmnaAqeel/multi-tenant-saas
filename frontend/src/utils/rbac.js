export const permissions = {
  admin: [
    'create_project',
    'create_task',
    'make_announcement',
    'edit_company',
    'invite_user',
    'manage_roles',
    'delete_project',
    'restore_project',
    'edit_project',
    'archive_project',
    'create_task',
    'add_project_members',
    'assign_task',
  ],
  editor: [
    'create_project',
    'create_task',
    'assign_task',
    'add_project_members',
    'assign_task',
  ],
  member: [
    'viewProject',
    'editTask',
  ],
};

export function hasPermission(role, action) {
  return permissions[role]?.includes(action);
}

export function RBAC({ role, action, children }) {
  if (!hasPermission(role, action)) return null;
  return children;
}

export function disable({ role, action}) {
  return !hasPermission(role, action);
}
