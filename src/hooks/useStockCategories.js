import { useState, useEffect } from 'react';
import {
  saveStockCategory,
  updateStockCategory,
  deleteStockCategory,
  onStockCategoriesChange
} from '../firebase/databaseService';

/**
 * 주식 분류 관리 커스텀 훅
 * SRP: 주식 분류 상태 및 CRUD 로직만 담당
 */
export const useStockCategories = (currentUser) => {
  const [stockCategories, setStockCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.firebaseId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onStockCategoriesChange(
      currentUser.firebaseId,
      (firebaseCategories) => {
        setStockCategories(firebaseCategories);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.firebaseId]);

  const handleAddCategory = async (categoryData) => {
    try {
      await saveStockCategory(currentUser.firebaseId, categoryData);
    } catch (error) {
      console.error('❌ 주식 분류 추가 실패:', error);
      alert('주식 분류 추가에 실패했습니다.');
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      await updateStockCategory(currentUser.firebaseId, categoryId, categoryData);
    } catch (error) {
      console.error('❌ 주식 분류 수정 실패:', error);
      alert('주식 분류 수정에 실패했습니다.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteStockCategory(currentUser.firebaseId, categoryId);
    } catch (error) {
      console.error('❌ 주식 분류 삭제 실패:', error);
      alert('주식 분류 삭제에 실패했습니다.');
    }
  };

  return {
    stockCategories,
    loading,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory
  };
};
