import { useState, useEffect } from 'react';
import {
  saveStock,
  updateStock,
  deleteStock,
  onStocksChange
} from '../firebase/databaseService';

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

    // 실시간 리스너 설정
    const unsubscribe = onStocksChange(
      currentUser.firebaseId,
      (firebaseStocks) => {
        setStocks(firebaseStocks);
        setLoading(false);

        // 현재가는 DB에 저장된 값 사용 (수동 입력)
        const prices = {};
        firebaseStocks.forEach(stock => {
          prices[stock.symbol] = stock.currentPrice || stock.buyPrice; // DB의 currentPrice 사용
        });
        setCurrentPrices(prices);
      }
    );

    // 클린업: 컴포넌트 언마운트 시 리스너 제거
    return () => unsubscribe();
  }, [currentUser?.firebaseId]);

  /**
   * 주식 추가 (동일 종목이면 holdings 배열에 추가)
   */
  const handleAddStock = async (formData) => {
    try {
      // 동일 종목이 이미 있는지 확인 (symbol만 비교)
      const existingStock = stocks.find(s => s.symbol === formData.symbol);

      if (existingStock) {
        // 동일 종목이 있으면 holdings 배열에 추가 또는 업데이트
        const holdings = existingStock.holdings || [];

        // 같은 계좌가 이미 있는지 확인
        const existingHoldingIndex = holdings.findIndex(h => h.account === formData.account);

        let updatedHoldings;
        if (existingHoldingIndex >= 0) {
          // 같은 계좌가 있으면 평균 매입가 계산
          const existingHolding = holdings[existingHoldingIndex];
          const totalQuantity = existingHolding.quantity + formData.quantity;
          const totalAmount = (existingHolding.quantity * existingHolding.buyPrice) +
                            (formData.quantity * formData.buyPrice);
          const avgBuyPrice = totalAmount / totalQuantity;

          updatedHoldings = [...holdings];
          updatedHoldings[existingHoldingIndex] = {
            ...existingHolding,
            quantity: totalQuantity,
            buyPrice: Math.round(avgBuyPrice * 100) / 100,
            buyDate: formData.buyDate // 최근 매입일로 업데이트
          };
        } else {
          // 새 계좌 추가
          updatedHoldings = [
            ...holdings,
            {
              account: formData.account,
              quantity: formData.quantity,
              buyPrice: formData.buyPrice,
              buyDate: formData.buyDate
            }
          ];
        }

        // 전체 수량과 평균 매입가 재계산
        const totalQuantity = updatedHoldings.reduce((sum, h) => sum + h.quantity, 0);
        const totalAmount = updatedHoldings.reduce((sum, h) => sum + (h.quantity * h.buyPrice), 0);
        const avgBuyPrice = totalAmount / totalQuantity;

        const updatedStock = {
          ...existingStock,
          holdings: updatedHoldings,
          quantity: totalQuantity,
          buyPrice: Math.round(avgBuyPrice * 100) / 100,
          currentPrice: formData.currentPrice || existingStock.currentPrice,
          updatedAt: new Date().toISOString()
        };

        await updateStock(currentUser.firebaseId, existingStock.id, updatedStock);
        alert(`${formData.name} 종목에 추가되었습니다!\n\n총 수량: ${totalQuantity}\n평균 매입가: ${avgBuyPrice.toLocaleString()}원`);
      } else {
        // 새 종목 추가
        const newStock = {
          ...formData,
          userId: currentUser?.id,
          currentPrice: formData.currentPrice || formData.buyPrice,
          holdings: [
            {
              account: formData.account,
              quantity: formData.quantity,
              buyPrice: formData.buyPrice,
              buyDate: formData.buyDate
            }
          ],
          createdAt: new Date().toISOString()
        };

        await saveStock(currentUser.firebaseId, newStock);
      }

      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 주식 추가 실패:', error);
      alert('주식 추가에 실패했습니다.');
    }
  };

  /**
   * 주식 수정 (전체 또는 계좌별)
   */
  const handleUpdateStock = async (id, formData, holdingIndex = null) => {
    try {
      const existingStock = stocks.find(s => s.id === id);
      if (!existingStock) {
        alert('주식을 찾을 수 없습니다.');
        return;
      }

      let updatedStock;

      // 계좌별 수정인 경우
      if (holdingIndex !== null && existingStock.holdings) {
        const updatedHoldings = [...existingStock.holdings];

        // 해당 인덱스의 holding 업데이트
        if (updatedHoldings[holdingIndex]) {
          updatedHoldings[holdingIndex] = {
            ...updatedHoldings[holdingIndex],
            account: formData.account,
            quantity: formData.quantity,
            buyPrice: formData.buyPrice,
            buyDate: formData.buyDate,
            memo: formData.memo
          };

          // 전체 수량과 평균 매입가 재계산
          const totalQuantity = updatedHoldings.reduce((sum, h) => sum + h.quantity, 0);
          const totalBuyValue = updatedHoldings.reduce((sum, h) => sum + (h.quantity * h.buyPrice), 0);
          const averageBuyPrice = totalBuyValue / totalQuantity;

          updatedStock = {
            ...existingStock,
            holdings: updatedHoldings,
            quantity: totalQuantity,
            buyPrice: averageBuyPrice,
            currentPrice: formData.currentPrice || existingStock.currentPrice,
            updatedAt: new Date().toISOString()
          };
        } else {
          alert('계좌 정보를 찾을 수 없습니다.');
          return;
        }
      } else {
        // 전체 수정인 경우 (기존 로직)
        updatedStock = {
          ...formData,
          updatedAt: new Date().toISOString()
        };
      }

      await updateStock(currentUser.firebaseId, id, updatedStock);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 주식 수정 실패:', error);
      alert('주식 수정에 실패했습니다.');
    }
  };

  /**
   * 주식 삭제 (전체 또는 계좌별)
   */
  const handleDeleteStock = async (id, holdingIndex = null) => {
    try {
      const existingStock = stocks.find(s => s.id === id);
      if (!existingStock) {
        alert('주식을 찾을 수 없습니다.');
        return;
      }

      // 계좌별 삭제인 경우
      if (holdingIndex !== null && existingStock.holdings) {
        const updatedHoldings = existingStock.holdings.filter((_, index) => index !== holdingIndex);

        // holdings가 비어있으면 전체 종목 삭제
        if (updatedHoldings.length === 0) {
          await deleteStock(currentUser.firebaseId, id);
          return;
        }

        // 전체 수량과 평균 매입가 재계산
        const totalQuantity = updatedHoldings.reduce((sum, h) => sum + h.quantity, 0);
        const totalBuyValue = updatedHoldings.reduce((sum, h) => sum + (h.quantity * h.buyPrice), 0);
        const averageBuyPrice = totalBuyValue / totalQuantity;

        const updatedStock = {
          ...existingStock,
          holdings: updatedHoldings,
          quantity: totalQuantity,
          buyPrice: averageBuyPrice,
          updatedAt: new Date().toISOString()
        };

        await updateStock(currentUser.firebaseId, id, updatedStock);
      } else {
        // 전체 종목 삭제인 경우
        if (!window.confirm('이 주식을 완전히 삭제하시겠습니까?')) {
          return;
        }

        await deleteStock(currentUser.firebaseId, id);
      }

      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 주식 삭제 실패:', error);
      alert('주식 삭제에 실패했습니다.');
    }
  };

  /**
   * 현재가 업데이트 (특정 종목)
   */
  const updateCurrentPrice = async (stockId, newPrice) => {
    try {
      const stock = stocks.find(s => s.id === stockId);
      if (!stock) return;

      const updatedStock = {
        ...stock,
        currentPrice: Number(newPrice),
        updatedAt: new Date().toISOString()
      };

      await updateStock(currentUser.firebaseId, stockId, updatedStock);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 현재가 업데이트 실패:', error);
      alert('현재가 업데이트에 실패했습니다.');
    }
  };

  /**
   * 현재가 일괄 업데이트 (여러 종목)
   */
  const updateMultiplePrices = async (priceUpdates) => {
    try {
      const promises = Object.entries(priceUpdates).map(([stockId, newPrice]) => {
        const stock = stocks.find(s => s.id === stockId);
        if (!stock) return null;

        const updatedStock = {
          ...stock,
          currentPrice: Number(newPrice),
          updatedAt: new Date().toISOString()
        };

        return updateStock(currentUser.firebaseId, stockId, updatedStock);
      }).filter(Boolean);

      await Promise.all(promises);
      alert(`${promises.length}개 종목의 현재가가 업데이트되었습니다.`);

      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 현재가 일괄 업데이트 실패:', error);
      alert('현재가 업데이트에 실패했습니다.');
    }
  };

  return {
    stocks,
    loading,
    currentPrices,
    handleAddStock,
    handleUpdateStock,
    handleDeleteStock,
    updateCurrentPrice,
    updateMultiplePrices
  };
};
