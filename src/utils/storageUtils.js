/**
 * localStorage 유틸리티
 * SRP: 데이터 저장/불러오기만 담당
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'budget_app_transactions',
  FIXED_EXPENSES: 'budget_app_fixed_expenses',
  SETTINGS: 'budget_app_settings',
  STOCK_PRICE_CACHE: 'budget_app_stock_price_cache'
};

/**
 * 데이터 저장
 */
export const saveToStorage = (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

/**
 * 데이터 불러오기
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const jsonData = localStorage.getItem(key);
    if (jsonData === null) {
      return defaultValue;
    }
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Export storage keys
export { STORAGE_KEYS };
