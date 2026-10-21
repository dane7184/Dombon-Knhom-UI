'use client';
import { SearchNormal1 } from 'iconsax-react';

interface SearchBarProps {
    value: string;
    onChangeAction: (value: string) => void;
    placeholder?: string;  // ← add this
}
export function SearchBarComponent ({ value, onChangeAction, placeholder = "Search..." }: SearchBarProps) {
    return(
        <div className="w-full relative ">
        <SearchNormal1 size={16} className="absolute left-3 top-3.5 text-slate-400" color="#000000"/>
        <input
          type="text"
          value={value}
            onChange={(e) => onChangeAction(e.target.value)}
            placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white ps-9 px-4 py-2.5 text-[16px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all"
        />
      </div>
    )
}


