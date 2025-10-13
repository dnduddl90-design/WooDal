/**
 * 사용자 상수
 * SRP: 사용자 관련 데이터만 관리
 */
export const USERS = {
  user1: {
    id: 'user1',
    name: '우영',
    avatar: '👨',
    role: 'admin',
    color: 'bg-blue-500'
  },
  user2: {
    id: 'user2',
    name: '달림',
    avatar: '👩',
    role: 'user',
    color: 'bg-pink-500'
  }
};

/**
 * ID로 사용자 찾기
 */
export const getUserById = (id) => {
  return USERS[id];
};

/**
 * 모든 사용자 가져오기
 */
export const getAllUsers = () => {
  return Object.values(USERS);
};
