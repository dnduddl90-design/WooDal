import { Coffee, Car, Home, Heart, ShoppingCart, Smartphone, MoreHorizontal, DollarSign, TrendingUp, Wallet } from 'lucide-react';

/**
 * 가계부 카테고리 상수
 * SRP: 카테고리 관련 데이터만 관리
 */
export const CATEGORIES = {
  expense: [
    {
      id: 'food',
      name: '식비',
      icon: Coffee,
      color: 'bg-orange-100 text-orange-600 border-orange-200',
      subCategories: ['외식', '장보기', '배달']
    },
    {
      id: 'transport',
      name: '교통비',
      icon: Car,
      color: 'bg-blue-100 text-blue-600 border-blue-200',
      subCategories: ['대중교통', '주유', '택시']
    },
    {
      id: 'living',
      name: '생활용품',
      icon: Home,
      color: 'bg-green-100 text-green-600 border-green-200',
      subCategories: ['마트', '약국', '청소용품']
    },
    {
      id: 'medical',
      name: '의료비',
      icon: Heart,
      color: 'bg-red-100 text-red-600 border-red-200',
      subCategories: ['병원', '약값', '건강검진']
    },
    {
      id: 'culture',
      name: '문화생활',
      icon: Coffee,
      color: 'bg-purple-100 text-purple-600 border-purple-200',
      subCategories: ['영화', '책', '취미']
    },
    {
      id: 'fashion',
      name: '의류미용',
      icon: ShoppingCart,
      color: 'bg-pink-100 text-pink-600 border-pink-200',
      subCategories: ['옷', '화장품', '미용실']
    },
    {
      id: 'communication',
      name: '통신비',
      icon: Smartphone,
      color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      subCategories: ['휴대폰', '인터넷']
    },
    {
      id: 'gift',
      name: '용돈선물',
      icon: Heart,
      color: 'bg-rose-100 text-rose-600 border-rose-200',
      subCategories: []
    },
    {
      id: 'savings',
      name: '저축',
      icon: Wallet,
      color: 'bg-teal-100 text-teal-600 border-teal-200',
      subCategories: ['예금', '적금', '투자']
    },
    {
      id: 'other',
      name: '기타',
      icon: MoreHorizontal,
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      subCategories: []
    }
  ],
  income: [
    {
      id: 'salary',
      name: '급여',
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      subCategories: ['우영', '달림']
    },
    {
      id: 'side',
      name: '부수입',
      icon: TrendingUp,
      color: 'bg-cyan-100 text-cyan-600 border-cyan-200',
      subCategories: ['투자', '부업']
    },
    {
      id: 'other',
      name: '기타',
      icon: MoreHorizontal,
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      subCategories: []
    }
  ]
};

/**
 * 카테고리 타입별로 가져오기
 */
export const getCategoriesByType = (type) => {
  return CATEGORIES[type] || [];
};

/**
 * ID로 카테고리 찾기
 */
export const getCategoryById = (type, categoryId) => {
  const categories = getCategoriesByType(type);
  return categories.find(cat => cat.id === categoryId);
};
