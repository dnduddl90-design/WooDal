import { useState, useEffect } from 'react';
import {
  saveStock,
  updateStock,
  deleteStock,
  onStocksChange
} from '../firebase/databaseService';
import { MOCK_STOCK_PRICES } from '../constants/stocks';

/**
 * 주식 관리 커스텀 훅 (Firebase 사용)
 * SRP: 주식 상태 및 CRUD 로직만 담당
 */
export const useStocks = (currentUser) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrices, setCurrentPrices] = useState({});

  /**
   * Firebase에서 주식 데이터 로드 및 실시간 리스너 설정
   */
  useEffect(() => {
    if (!currentUser?.firebaseId) {
      setLoading(false);
      return;
    }

    console.log('📥 Firebase에서 주식 데이터 로드 중...');

    // 실시간 리스너 설정
    const unsubscribe = onStocksChange(
      currentUser.firebaseId,
      (firebaseStocks) => {
        console.log(`✅ 주식 ${firebaseStocks.length}건 로드됨`);
        setStocks(firebaseStocks);
        setLoading(false);

        // MOCK 데이터로 현재가 설정 (API 연동 전)
        const prices = {};
        firebaseStocks.forEach(stock => {
          prices[stock.symbol] = MOCK_STOCK_PRICES[stock.symbol] || stock.buyPrice;
        });
        setCurrentPrices(prices);
      }
    );

    // 클린업: 컴포넌트 언마운트 시 리스너 제거
    return () => unsubscribe();
  }, [currentUser?.firebaseId]);

  /**
   * 주식 추가
   */
  const handleAddStock = async (formData) => {
    try {
      const newStock = {
        ...formData,
        userId: currentUser?.id,
        createdAt: new Date().toISOString()
      };

      const savedId = await saveStock(currentUser.firebaseId, newStock);
      console.log('✅ 주식 추가 성공:', savedId);

      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 주식 추가 실패:', error);
      alert('주식 추가에 실패했습니다.');
    }
  };

  /**
   * 주식 수정
   */
  const handleUpdateStock = async (id, formData) => {
    try {
      const updatedStock = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      await updateStock(currentUser.firebaseId, id, updatedStock);
      console.log('✅ 주식 수정 성공:', id);

      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 주식 수정 실패:', error);
      alert('주식 수정에 실패했습니다.');
    }
  };

  /**
   * 주식 삭제
   */
  const handleDeleteStock = async (id) => {
    try {
      if (!window.confirm('이 주식을 삭제하시겠습니까?')) {
        return;
      }

      await deleteStock(currentUser.firebaseId, id);
      console.log('✅ 주식 삭제 성공:', id);

      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 주식 삭제 실패:', error);
      alert('주식 삭제에 실패했습니다.');
    }
  };

  /**
   * 현재가 새로고침 (API 연동 전에는 MOCK 데이터 사용)
   */
  const refreshPrices = () => {
    const prices = {};
    stocks.forEach(stock => {
      prices[stock.symbol] = MOCK_STOCK_PRICES[stock.symbol] || stock.buyPrice;
    });
    setCurrentPrices(prices);
    console.log('🔄 주식 현재가 업데이트됨 (MOCK 데이터)');
  };

  return {
    stocks,
    loading,
    currentPrices,
    handleAddStock,
    handleUpdateStock,
    handleDeleteStock,
    refreshPrices
  };
};
