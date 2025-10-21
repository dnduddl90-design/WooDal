import { useState, useEffect } from 'react';
import { onAuthChange, logout as firebaseLogout } from '../firebase';
import { getUserFamilyId, getFamily, onInvitationsChange, onAvatarChange, saveUserAvatar } from '../firebase/databaseService';
import { DEFAULT_AVATARS } from '../constants';

/**
 * 인증 관리 커스텀 훅 (Firebase 사용)
 * SRP: 인증 상태 및 로직만 담당
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [familyInfo, setFamilyInfo] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [userAvatar, setUserAvatar] = useState(DEFAULT_AVATARS.user1);
  const [firebaseUser, setFirebaseUser] = useState(null);

  /**
   * Firebase 인증 상태 변경 감지 및 가족 정보 로드
   */
  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);

        // 가족 정보 로드
        try {
          const familyId = await getUserFamilyId(fbUser.uid);
          if (familyId) {
            const family = await getFamily(familyId);
            setFamilyInfo(family);
            console.log('👨‍👩‍👧‍👦 가족 정보 로드됨:', family.name);
          } else {
            setFamilyInfo(null);
            console.log('👤 개인 가계부 모드 (가족 없음)');
          }
        } catch (error) {
          console.error('❌ 가족 정보 로드 실패:', error);
          setFamilyInfo(null);
        }

        setIsAuthenticated(true);
        console.log('✅ 인증 상태 변경: 로그인됨', fbUser.email);
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        setFamilyInfo(null);
        setIsAuthenticated(false);
        console.log('✅ 인증 상태 변경: 로그아웃됨');
      }
      setLoading(false);
    });

    // 클린업: 컴포넌트 언마운트 시 리스너 제거
    return () => unsubscribe();
  }, []);

  /**
   * firebaseUser, userAvatar, familyInfo가 변경될 때 currentUser 업데이트
   */
  useEffect(() => {
    if (!firebaseUser) return;

    // Google 이름에서 이메일 제거하고 실제 이름만 추출
    let displayName = firebaseUser.displayName || firebaseUser.email.split('@')[0];

    // 이메일 형식이면 @앞부분만 사용
    if (displayName.includes('@')) {
      displayName = displayName.split('@')[0];
    }

    // 가족 구성원인 경우 역할 확인
    let userId = firebaseUser.uid; // 기본: Firebase UID 사용
    let userRole = 'admin'; // 기본: 관리자

    if (familyInfo && familyInfo.members) {
      // 가족 멤버 중에서 현재 사용자 찾기
      const memberEntry = Object.entries(familyInfo.members).find(
        ([memberId, memberData]) => memberId === firebaseUser.uid
      );

      if (memberEntry) {
        const [memberId, memberData] = memberEntry;
        userId = memberId; // Firebase UID 그대로 사용
        userRole = memberData.role || 'member';
        displayName = memberData.name || displayName; // 가족 내 이름 우선 사용
      }
    }

    const user = {
      id: userId, // Firebase UID를 userId로 사용 (각 사용자 고유)
      firebaseId: firebaseUser.uid, // Firebase UID (호환성)
      email: firebaseUser.email.toLowerCase(), // 이메일은 항상 소문자로 저장 (초대 매칭용)
      name: displayName, // 가족 내 이름 또는 Google 이름
      avatar: userAvatar || DEFAULT_AVATARS.user1, // 아바타 (커스터마이징 가능)
      role: userRole // 가족 내 역할 (admin/member)
    };

    setCurrentUser(user);
    console.log('👤 사용자 정보 업데이트:', user);
    console.log('👤 현재 userAvatar:', userAvatar);
  }, [firebaseUser, userAvatar, familyInfo]);

  /**
   * 초대 확인 리스너 설정
   */
  useEffect(() => {
    if (!currentUser?.email) return;

    // 이메일을 소문자로 정규화 (대소문자 매칭 문제 해결)
    const normalizedEmail = currentUser.email.toLowerCase();
    console.log('📬 초대 리스너 시작:', normalizedEmail);

    // 실시간 초대 리스너 설정
    const unsubscribe = onInvitationsChange(normalizedEmail, (invitations) => {
      setPendingInvitations(invitations);
      if (invitations.length > 0) {
        console.log(`📩 대기 중인 초대 ${invitations.length}건 발견`);
      }
    });

    // 클린업
    return () => unsubscribe();
  }, [currentUser?.email]);

  /**
   * 아바타 실시간 리스너 설정
   */
  useEffect(() => {
    if (!currentUser?.firebaseId) return;

    console.log('🎨 아바타 리스너 시작');

    // 실시간 아바타 리스너 설정
    const unsubscribe = onAvatarChange(currentUser.firebaseId, (avatar) => {
      if (avatar) {
        setUserAvatar(avatar);
        console.log('🎨 아바타 업데이트:', avatar);
      }
    });

    // 클린업
    return () => unsubscribe();
  }, [currentUser?.firebaseId]);

  /**
   * 로그인 처리
   * LoginPage에서 Google 로그인 후 호출
   */
  const handleLogin = (firebaseUser) => {
    // Firebase 인증 리스너가 자동으로 처리하므로 여기서는 아무것도 안 해도 됨
    console.log('✅ 로그인 성공:', firebaseUser.email);
  };

  /**
   * 로그아웃 처리
   */
  const handleLogout = async () => {
    try {
      await firebaseLogout();
      console.log('✅ 로그아웃 성공');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
    }
  };

  /**
   * 아바타 변경 처리
   */
  const handleChangeAvatar = async (newAvatar) => {
    if (!currentUser?.firebaseId) return;

    try {
      await saveUserAvatar(currentUser.firebaseId, newAvatar);
      setUserAvatar(newAvatar);
      console.log('✅ 아바타 변경 완료:', newAvatar);
    } catch (error) {
      console.error('❌ 아바타 변경 실패:', error);
      alert('아바타 변경에 실패했습니다.');
    }
  };

  return {
    isAuthenticated,
    currentUser,
    familyInfo,
    pendingInvitations,
    userAvatar,
    loading,
    handleLogin,
    handleLogout,
    handleChangeAvatar
  };
};
