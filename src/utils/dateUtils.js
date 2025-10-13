/**
 * 날짜 관련 유틸리티 함수
 * SRP: 날짜 처리 로직만 담당
 */

/**
 * 해당 월의 총 일수를 반환
 */
export const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * 해당 월의 첫 번째 날의 요일을 반환 (0: 일요일 ~ 6: 토요일)
 */
export const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 오늘인지 확인
 */
export const isToday = (day, month, year) => {
  const today = new Date();
  return (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  );
};

/**
 * 두 날짜가 같은 날인지 확인
 */
export const isSameDate = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
