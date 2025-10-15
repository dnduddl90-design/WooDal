/**
 * AvatarPicker Component
 *
 * 사용자가 이모지 아바타를 선택할 수 있는 컴포넌트
 * 카테고리별로 이모지를 표시하고 선택 가능
 */

import React, { useState } from 'react';
import { AVATAR_CATEGORIES } from '../../constants';

export const AvatarPicker = ({
  currentAvatar,
  onSelect,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState('faces');

  const handleEmojiClick = (emoji) => {
    onSelect(emoji);
    onClose();
  };

  const categories = Object.values(AVATAR_CATEGORIES);
  const currentCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">아바타 선택</h3>
              <p className="text-sm text-white/80 mt-1">
                현재: <span className="text-2xl">{currentAvatar}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto bg-white/50 border-b border-gray-200">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex-shrink-0 px-4 py-3 text-sm font-medium transition-all
                ${selectedCategory === category.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white/80'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          <div className="grid grid-cols-8 gap-2">
            {currentCategoryData?.emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className={`
                  w-full aspect-square flex items-center justify-center
                  text-2xl rounded-lg transition-all hover:scale-110
                  ${emoji === currentAvatar
                    ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                    : 'bg-white/50 hover:bg-purple-50'
                  }
                `}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            이모지를 선택하면 자동으로 저장됩니다
          </p>
        </div>
      </div>
    </div>
  );
};
