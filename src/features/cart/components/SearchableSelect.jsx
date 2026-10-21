import { useEffect, useId, useMemo, useRef, useState } from 'react';
import './SearchableSelect.css';

// Bảng viết tắt thông dụng các tỉnh thành lớn tại Việt Nam
const COMMON_ALIASES = {
  hcm: ['thành phố hồ chí minh', 'hồ chí minh', 'sài gòn', 'sai gon', 'tphcm', 'tp hcm'],
  sg: ['thành phố hồ chí minh', 'hồ chí minh', 'sài gòn', 'sai gon'],
  hn: ['thành phố hà nội', 'hà nội', 'ha noi', 'tphn', 'tp hn'],
  dn: ['thành phố đà nẵng', 'đà nẵng', 'da nang'],
  ct: ['thành phố cần thơ', 'cần thơ', 'can tho'],
  hp: ['thành phố hải phòng', 'hải phòng', 'hai phong'],
  hue: ['thành phố huế', 'huế', 'thừa thiên huế'],
  dl: ['tỉnh lâm đồng', 'đà lạt', 'da lat', 'lâm đồng'],
  bmt: ['tỉnh đắk lắk', 'đắk lắk', 'buôn ma thuột', 'dak lak']
};

function removeVietnameseAccents(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export default function SearchableSelect({
  id,
  name,
  options = [],
  value = '',
  onChange,
  placeholder = 'Chọn một mục...',
  searchPlaceholder = 'Gõ để tìm nhanh...',
  disabled = false,
  isLoading = false,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const uniqueId = useId();
  const selectId = id || uniqueId;

  // Tìm option hiện đang được chọn
  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.code) === String(value)) || null;
  }, [options, value]);

  // Lọc options theo từ khóa tìm kiếm (hỗ trợ cả có dấu, không dấu và viết tắt)
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;

    const rawTerm = searchTerm.trim().toLowerCase();
    const cleanTerm = removeVietnameseAccents(searchTerm);

    // Kiểm tra xem từ khóa có nằm trong alias viết tắt không
    const matchedAliases = COMMON_ALIASES[rawTerm] || COMMON_ALIASES[cleanTerm] || [];

    return options.filter((opt) => {
      const optName = String(opt.name || '');
      const optClean = removeVietnameseAccents(optName);

      // Khớp trực tiếp có dấu hoặc không dấu
      if (optClean.includes(cleanTerm)) return true;
      if (optName.toLowerCase().includes(rawTerm)) return true;

      // Khớp theo alias viết tắt
      if (matchedAliases.some((alias) => optClean.includes(removeVietnameseAccents(alias)))) {
        return true;
      }

      // Khớp theo mã code nếu người dùng gõ số
      if (String(opt.code) === rawTerm) return true;

      return false;
    });
  }, [options, searchTerm]);

  // Reset search term và highlight khi đóng mở
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setHighlightedIndex(-1);
      // Focus vào input tìm kiếm sau khi render dropdown
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Click outside listener để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Điều khiển bằng bàn phím
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (filteredOptions.length === 1) {
        handleSelect(filteredOptions[0]);
      }
    }
  };

  const scrollIntoView = (index) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.searchable-select__item');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  const handleSelect = (option) => {
    onChange?.(String(option.code), option);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('', null);
    setSearchTerm('');
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-select ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input to ensure HTML5 form validation 'required' works natively */}
      <input
        type="text"
        id={selectId}
        name={name}
        required={required}
        value={value || ''}
        onChange={() => {}}
        tabIndex={-1}
        className="searchable-select__native-validator"
        aria-hidden="true"
      />

      {/* Trigger Button */}
      <button
        type="button"
        className={`searchable-select__trigger ${selectedOption ? 'has-value' : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="searchable-select__trigger-text">
          {isLoading ? (
            <span className="searchable-select__loading-label">Đang tải dữ liệu…</span>
          ) : selectedOption ? (
            selectedOption.name
          ) : (
            <span className="searchable-select__placeholder">{placeholder}</span>
          )}
        </span>

        <span className="searchable-select__trigger-actions">
          {selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              className="searchable-select__clear-btn"
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e)}
              title="Xóa lựa chọn"
              aria-label="Xóa lựa chọn"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </span>
          )}
          <span className="searchable-select__arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </span>
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && !disabled && (
        <div className="searchable-select__dropdown" role="listbox">
          {/* Search Box Header */}
          <div className="searchable-select__search-wrapper">
            <span className="searchable-select__search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              ref={searchInputRef}
              type="text"
              className="searchable-select__search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder={searchPlaceholder}
              autoComplete="off"
              spellCheck="false"
            />
            {searchTerm && (
              <button
                type="button"
                className="searchable-select__search-clear"
                onClick={() => {
                  setSearchTerm('');
                  searchInputRef.current?.focus();
                }}
                aria-label="Xóa từ khóa tìm kiếm"
              >
                ×
              </button>
            )}
          </div>

          {/* Results Summary Counter */}
          <div className="searchable-select__stats">
            {searchTerm ? (
              <span>Tìm thấy <b>{filteredOptions.length}</b> kết quả cho &ldquo;{searchTerm}&rdquo;</span>
            ) : (
              <span>Danh sách ({options.length} mục) - Gõ để lọc nhanh</span>
            )}
          </div>

          {/* Scrollable Options List */}
          <ul ref={listRef} className="searchable-select__list">
            {filteredOptions.length === 0 ? (
              <li className="searchable-select__empty">
                <span>Không tìm thấy &ldquo;{searchTerm}&rdquo;</span>
                <small>Thử tìm với tên không dấu hoặc gõ từ khóa khác.</small>
              </li>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = String(opt.code) === String(value);
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={opt.code}
                    role="option"
                    aria-selected={isSelected}
                    className={`searchable-select__item ${isSelected ? 'is-selected' : ''} ${isHighlighted ? 'is-highlighted' : ''}`}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="searchable-select__item-name">{opt.name}</span>
                    {isSelected && (
                      <span className="searchable-select__item-check" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
