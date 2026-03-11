import React, { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Search } from 'lucide-react';
import { Button, Input, Modal } from '../common';

/**
 * 주식 분류 관리 컴포넌트
 * SRP: 주식 분류 추가/수정/삭제 UI만 담당
 */
export const StockCategoryManager = ({
  stockCategories = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  currentUser
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const isAdmin = currentUser?.role === 'admin';

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedName = formData.name.trim();
    if (!normalizedName) {
      alert('분류 이름을 입력해주세요.');
      return;
    }

    const isDuplicate = stockCategories.some((category) =>
      category.name?.trim().toLowerCase() === normalizedName.toLowerCase() &&
      (!editingCategory || category.id !== editingCategory.id)
    );

    if (isDuplicate) {
      alert('이미 등록된 분류 이름입니다.');
      return;
    }

    const payload = { name: normalizedName };
    if (editingCategory) {
      onUpdateCategory(editingCategory.id, payload);
    } else {
      onAddCategory(payload);
    }

    setShowForm(false);
    setFormData({ name: '' });
  };

  const handleDelete = (category) => {
    if (window.confirm(`'${category.name}' 분류를 삭제하시겠습니까?`)) {
      onDeleteCategory(category.id);
    }
  };

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const searchedCategories = stockCategories.filter((category) => {
      if (!normalizedQuery) {
        return true;
      }

      return category.name?.toLowerCase().includes(normalizedQuery);
    });

    return [...searchedCategories].sort((a, b) => {
      if (sortBy === 'recent') {
        return (b.id || '').localeCompare(a.id || '', 'ko');
      }

      return (a.name || '').localeCompare(b.name || '', 'ko');
    });
  }, [searchQuery, sortBy, stockCategories]);

  if (!isAdmin) {
    return (
      <div className="glass-effect p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <FolderTree className="text-emerald-600" size={24} />
          <h3 className="text-lg font-bold text-gray-800">주식 분류 관리</h3>
        </div>
        <p className="text-gray-600 text-sm">관리자만 주식 분류를 관리할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="glass-effect p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FolderTree className="text-emerald-600" size={24} />
          <h3 className="text-lg font-bold text-gray-800">주식 분류 관리</h3>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={handleAdd}
        >
          분류 추가
        </Button>
      </div>

      <div className="flex flex-col gap-3 mb-4 sm:flex-row">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="분류 검색"
            icon={Search}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl bg-white/80 text-sm"
        >
          <option value="name">이름순</option>
          <option value="recent">최근 추가순</option>
        </select>
      </div>

      {stockCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FolderTree size={48} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">등록된 분류가 없습니다.</p>
          <p className="text-xs mt-1">예: 국내ETF, 배당, 안전자산</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Search size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2 lg:max-h-96 lg:overflow-y-auto">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-800">{category.name}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="수정"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category)}
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

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingCategory ? '분류 수정' : '분류 추가'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="분류 이름"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="예: 안전자산"
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
              {editingCategory ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
