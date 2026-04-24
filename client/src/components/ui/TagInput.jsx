import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function TagInput({ tags, setTags, placeholder = "Etiket ekle..." }) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedInput = input.trim().toLowerCase();
    if (trimmedInput && !tags.includes(trimmedInput)) {
      setTags([...tags, trimmedInput]);
      setInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-200"
          >
            #{tag}
            <button 
              type="button" 
              onClick={() => removeTag(tag)}
              className="hover:text-danger transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      
      <div className="relative group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-surface2/50 border border-border focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-textSecondary/30"
        />
        <button
          type="button"
          onClick={addTag}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-textSecondary hover:text-primary transition-colors"
          title="Ekle"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-textSecondary italic ml-1">
        Virgül veya Enter ile ayırarak birden fazla etiket ekleyebilirsin.
      </p>
    </div>
  );
}
