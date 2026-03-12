import React, { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, Search } from 'lucide-react';
import { Button, Input, Modal } from '../common';

/**
 * 주식 종목 관리 컴포넌트
 * SRP: 종목 추가/수정/삭제 UI만 담당
 */
export const StockSymbolManager = ({
  stockSymbols = [],
  onAddSymbol,
  onUpdateSymbol,
  onDeleteSymbol,
  currentUser
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSymbol, setEditingSymbol] = useState(null);
  const [formData, setFormData] = useState({ symbol: '', name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // 관리자 권한 확인
  const isAdmin = currentUser?.role === 'admin';

  // 폼 열기
  const handleAdd = () => {
    setEditingSymbol(null);
    setFormData({ symbol: '', name: '' });
    setShowForm(true);
  };

  // 수정 모드로 폼 열기
  const handleEdit = (symbol) => {
    setEditingSymbol(symbol);
    setFormData({ symbol: symbol.symbol, name: symbol.name });
    setShowForm(true);
  };

  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.symbol || !formData.name) {
      alert('종목 코드와 이름을 모두 입력해주세요.');
      return;
    }

    // 중복 체크
    const isDuplicate = stockSymbols.some(s =>
      s.symbol === formData.symbol && (!editingSymbol || s.id !== editingSymbol.id)
    );

    if (isDuplicate) {
      alert('이미 등록된 종목 코드입니다.');
      return;
    }

    if (editingSymbol) {
      onUpdateSymbol(editingSymbol.id, formData);
    } else {
      onAddSymbol(formData);
    }

    setShowForm(false);
    setFormData({ symbol: '', name: '' });
  };

  // 삭제
  const handleDelete = (symbol) => {
    if (window.confirm(`'${symbol.name}' 종목을 삭제하시겠습니까?`)) {
      onDeleteSymbol(symbol.id);
    }
  };

  const filteredSymbols = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const searchedSymbols = stockSymbols.filter((symbol) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        symbol.name?.toLowerCase().includes(normalizedQuery) ||
        symbol.symbol?.toLowerCase().includes(normalizedQuery)
      );
    });

    return [...searchedSymbols].sort((a, b) => {
      if (sortBy === 'symbol') {
        return (a.symbol || '').localeCompare(b.symbol || '', 'ko');
      }

      return (a.name || '').localeCompare(b.name || '', 'ko');
    });
  }, [searchQuery, sortBy, stockSymbols]);

  // 권한이 없는 경우
  if (!isAdmin) {
    return (
      <div className="glass-effect p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-indigo-600" size={24} />
          <h3 className="text-lg font-bold text-slate-800">주식 종목 관리</h3>
        </div>
        <p className="text-slate-600 text-sm">관리자만 종목을 관리할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="glass-effect p-6 rounded-xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-indigo-600" size={24} />
          <h3 className="text-lg font-bold text-slate-800">주식 종목 관리</h3>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={handleAdd}
        >
          종목 추가
        </Button>
      </div>

      <div className="flex flex-col gap-3 mb-4 sm:flex-row">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="종목명 또는 코드 검색"
            icon={Search}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-xl bg-white/80 text-sm text-slate-700"
        >
          <option value="name">이름순</option>
          <option value="symbol">코드순</option>
        </select>
      </div>

      {/* 종목 목록 */}
      {stockSymbols.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <TrendingUp size={48} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">등록된 종목이 없습니다.</p>
        </div>
      ) : filteredSymbols.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Search size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2 lg:max-h-96 lg:overflow-y-auto">
          {filteredSymbols.map((symbol) => (
            <div
              key={symbol.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-slate-800">{symbol.name}</div>
                <div className="text-xs text-slate-500">{symbol.symbol}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(symbol)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="수정"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(symbol)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 종목 추가/수정 모달 */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingSymbol ? '종목 수정' : '종목 추가'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="종목 코드"
            required
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="예: 411060"
          />
          <Input
            label="종목 이름"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="예: ACE KRX금현물"
          />
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {editingSymbol ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
