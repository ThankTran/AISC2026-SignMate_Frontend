import { Search } from "lucide-react";

const HeaderSearch = ({ value, onChange, placeholder = "Tìm kiếm..." }) => {
  return (
    <div className="header-search">
      <Search size={16} strokeWidth={1.8} className="header-search__icon" />

      <input
        type="text"
        className="header-search__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};

export default HeaderSearch;