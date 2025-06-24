import { useState, useEffect } from 'react';

interface Selection {
  questionId: number;
  selectedOption: 'A' | 'B' | 'C';
}

export function useSelections() {
  // Initialize state with localStorage data
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('selectedQuestions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [questionChoices, setQuestionChoices] = useState<Record<number, 'A' | 'B' | 'C'>>(() => {
    try {
      const saved = localStorage.getItem('questionChoices');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedQuestions', JSON.stringify(selectedQuestions));
  }, [selectedQuestions]);

  useEffect(() => {
    localStorage.setItem('questionChoices', JSON.stringify(questionChoices));
  }, [questionChoices]);

  const MAX_SELECTIONS = 5;

  const toggleSelection = (questionId: number, option: 'A' | 'B' | 'C' = 'B') => {
    const isSelected = selectedQuestions.includes(questionId);
    
    if (isSelected) {
      // Deselect
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
      setQuestionChoices(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    } else if (selectedQuestions.length < MAX_SELECTIONS) {
      // Select with default option B (highest votes in most cases)
      setSelectedQuestions(prev => [...prev, questionId]);
      setQuestionChoices(prev => ({ ...prev, [questionId]: option }));
    } else {
      // Max selections reached
      alert('You can only select 5 questions maximum!');
    }
  };

  const selectionCount = selectedQuestions.length;
  const canSubmit = selectionCount === MAX_SELECTIONS;
  
  const getProgressWidth = () => {
    return (selectionCount / MAX_SELECTIONS) * 100;
  };

  const getSelectedQuestionsWithChoices = (): Selection[] => {
    return selectedQuestions.map(questionId => ({
      questionId,
      selectedOption: questionChoices[questionId] || 'B'
    }));
  };

  const setQuestionChoice = (questionId: number, option: 'A' | 'B' | 'C') => {
    if (selectedQuestions.includes(questionId)) {
      setQuestionChoices(prev => ({ ...prev, [questionId]: option }));
    }
  };

  const clearSelections = () => {
    setSelectedQuestions([]);
    setQuestionChoices({});
    localStorage.removeItem('selectedQuestions');
    localStorage.removeItem('questionChoices');
  };

  return {
    selectedQuestions,
    questionChoices,
    selectionCount,
    canSubmit,
    toggleSelection,
    setQuestionChoice,
    getProgressWidth,
    getSelectedQuestionsWithChoices,
    clearSelections
  };
}
