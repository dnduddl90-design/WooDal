import { useState, useEffect } from 'react';
import {
  saveStockSymbol,
  updateStockSymbol,
  deleteStockSymbol,
  onStockSymbolsChange
} from '../firebase/databaseService';
import { ETF_STOCKS } from '../constants/stocks';

/**
 * 주식 종목 관리 커스텀 훅
 * SRP: 주식 종목 상태 및 CRUD 로직만 담당
 */
export const useStockSymbols = (currentUser) => {
  const [stockSymbols, setStockSymbols] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Firebase에서 종목 데이터 로드 및 실시간 리스너 설정
   */
  useEffect(() => {
    if (!currentUser?.firebaseId) {
      setLoading(false);
      return;
    }

    // 실시간 리스너 설정
    const unsubscribe = onStockSymbolsChange(
      currentUser.firebaseId,
      (firebaseSymbols) => {
        // Firebase 데이터가 비어있으면 기본 종목 마이그레이션
        if (firebaseSymbols.length === 0) {
          migrateDefaultSymbols();
        } else {
          setStockSymbols(firebaseSymbols);
          setLoading(false);
        }
      }
    );

    // 클린업: 컴포넌트 언마운트 시 리스너 제거
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.firebaseId]);

  /**
   * 기본 종목을 Firebase로 마이그레이션
   */
  const migrateDefaultSymbols = async () => {
    try {
      for (const symbol of ETF_STOCKS) {
        await saveStockSymbol(currentUser.firebaseId, symbol);
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ 기본 종목 마이그레이션 실패:', error);
      // 실패 시 로컬 데이터 사용
      setStockSymbols(ETF_STOCKS.map((s, idx) => ({ ...s, id: `default-${idx}` })));
      setLoading(false);
    }
  };

  /**
   * 종목 추가
   */
  const handleAddSymbol = async (symbolData) => {
    try {
      await saveStockSymbol(currentUser.firebaseId, symbolData);
    } catch (error) {
      console.error('❌ 종목 추가 실패:', error);
      alert('종목 추가에 실패했습니다.');
    }
  };

  /**
   * 종목 수정
   */
  const handleUpdateSymbol = async (symbolId, symbolData) => {
    try {
      await updateStockSymbol(currentUser.firebaseId, symbolId, symbolData);
    } catch (error) {
      console.error('❌ 종목 수정 실패:', error);
      alert('종목 수정에 실패했습니다.');
    }
  };

  /**
   * 종목 삭제
   */
  const handleDeleteSymbol = async (symbolId) => {
    try {
      await deleteStockSymbol(currentUser.firebaseId, symbolId);
    } catch (error) {
      console.error('❌ 종목 삭제 실패:', error);
      alert('종목 삭제에 실패했습니다.');
    }
  };

  return {
    stockSymbols,
    loading,
    handleAddSymbol,
    handleUpdateSymbol,
    handleDeleteSymbol
  };
};
