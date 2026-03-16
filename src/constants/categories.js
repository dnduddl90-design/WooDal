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
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      subCategories: ['외식', '장보기', '배달']
    },
    {
      id: 'transport',
      name: '교통비',
      icon: Car,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      subCategories: ['대중교통', '주유', '택시']
    },
    {
      id: 'living',
      name: '생활용품',
      icon: Home,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      subCategories: ['마트', '약국', '청소용품']
    },
    {
      id: 'medical',
      name: '의료비',
      icon: Heart,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      subCategories: ['병원', '약값', '건강검진']
    },
    {
      id: 'culture',
      name: '문화생활',
      icon: Coffee,
      color: 'bg-violet-50 text-violet-700 border-violet-200',
      subCategories: ['영화', '책', '취미']
    },
    {
      id: 'fashion',
      name: '의류미용',
      icon: ShoppingCart,
      color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      subCategories: ['옷', '화장품', '미용실']
    },
    {
      id: 'communication',
      name: '통신비',
      icon: Smartphone,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      subCategories: ['예금', '적금', '투자']
    },
    {
      id: 'other',
      name: '기타',
      icon: MoreHorizontal,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      subCategories: []
    }
  ],
  income: [
    {
      id: 'salary',
      name: '급여',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      subCategories: ['사용자 1', '사용자 2']
    },
    {
      id: 'side',
      name: '부수입',
      icon: TrendingUp,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      subCategories: ['투자', '부업']
    },
    {
      id: 'other',
      name: '기타',
      icon: MoreHorizontal,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
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
