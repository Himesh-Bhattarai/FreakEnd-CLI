const ROLES = {
    USER: 'user',
    PREMIUM_USER: 'premium_user',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  };
  
  const PERMISSIONS = {
    [ROLES.USER]: [
      'read:own_profile',
      'update:own_profile',
      'delete:own_account'
    ],
    [ROLES.PREMIUM_USER]: [
      ...PERMISSIONS[ROLES.USER],
      'create:content',
      'update:own_content',
      'delete:own_content'
    ],
    [ROLES.MODERATOR]: [
      ...PERMISSIONS[ROLES.PREMIUM_USER],
      'read:any_profile',
      'update:any_content',
      'delete:any_content',
      'ban:user'
    ],
    [ROLES.ADMIN]: [
      ...PERMISSIONS[ROLES.MODERATOR],
      'create:user',
      'update:user_roles',
      'delete:any_user'
    ],
    [ROLES.SUPER_ADMIN]: [
      ...PERMISSIONS[ROLES.ADMIN],
      'manage:system_settings',
      'manage:all_roles'
    ]
  };
  
  const checkPermission = (requiredPermission, userRole) => {
    if (!userRole) return false;
    return PERMISSIONS[userRole]?.includes(requiredPermission) || false;
  };
  
  module.exports = {
    ROLES,
    PERMISSIONS,
    checkPermission
  };