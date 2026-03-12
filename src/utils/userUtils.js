import { USERS } from '../constants';

const ROLE_COLORS = {
  admin: 'bg-blue-500',
  member: 'bg-indigo-500',
  user: 'bg-indigo-500'
};

const shortenName = (name) => {
  if (!name) return '알 수 없음';
  if (name.length > 2 && !name.includes(' ')) {
    return name.slice(-2);
  }
  return name;
};

export const resolveUserInfo = (userId, familyInfo = null, currentUser = null, options = {}) => {
  const { shortName = false } = options;

  if (familyInfo?.members?.[userId]) {
    const member = familyInfo.members[userId];
    const role = member.role || 'member';
    const name = shortName ? shortenName(member.name) : (member.name || '알 수 없음');
    const avatar = member.avatar || (currentUser?.id === userId ? currentUser.avatar : (role === 'admin' ? '👨' : '👩'));

    return {
      id: userId,
      name,
      avatar,
      role,
      color: ROLE_COLORS[role] || 'bg-gray-500'
    };
  }

  if (USERS[userId]) {
    return USERS[userId];
  }

  if (currentUser?.id === userId) {
    return {
      id: currentUser.id,
      name: shortName ? shortenName(currentUser.name) : currentUser.name,
      avatar: currentUser.avatar || '👤',
      role: currentUser.role || 'member',
      color: ROLE_COLORS[currentUser.role] || 'bg-gray-500'
    };
  }

  return {
    id: userId,
    name: '알 수 없음',
    avatar: '👤',
    role: 'member',
    color: 'bg-gray-500'
  };
};

export const getAvailableUsers = (familyInfo = null, currentUser = null) => {
  if (familyInfo?.members) {
    return Object.keys(familyInfo.members).map((userId) =>
      resolveUserInfo(userId, familyInfo, currentUser)
    );
  }

  if (currentUser?.id && !USERS[currentUser.id]) {
    return [resolveUserInfo(currentUser.id, familyInfo, currentUser)];
  }

  return Object.values(USERS);
};
