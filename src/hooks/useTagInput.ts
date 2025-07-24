import { useState, useCallback, useEffect } from 'react';
import { getAllUniqueTags } from '@/lib/memoryService';

export const useTagInput = (initialTags: string[] = []) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allAvailableTags, setAllAvailableTags] = useState<{ tag: string; count: number }[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await getAllUniqueTags();
        setAllAvailableTags(fetchedTags);
      } catch (error) {
        console.error("Failed to fetch unique tags:", error);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (inputValue.length === 0) {
      // Show popular tags when input is empty
      setSuggestions(allAvailableTags.slice(0, 5).map(t => t.tag).filter(tag => !tags.includes(tag)));
    } else {
      const filteredSuggestions = allAvailableTags.filter(tag =>
        tag.tag.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(tag.tag)
      ).map(t => t.tag);
      setSuggestions(filteredSuggestions);
    }
  }, [inputValue, tags, allAvailableTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
      setSuggestions([]);
    }
  };

  const addTagFromSuggestion = useCallback((tag: string) => {
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
    setInputValue('');
    setSuggestions([]);
  }, [tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const resetTags = useCallback((newTags: string[] = []) => {
    setTags(newTags);
    setInputValue('');
    setSuggestions([]);
  }, []);

  return {
    tags,
    setTags,
    inputValue,
    handleInputChange,
    handleInputKeyDown,
    removeTag,
    resetTags,
    suggestions,
    addTagFromSuggestion,
  };
};
