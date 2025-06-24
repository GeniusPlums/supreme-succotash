import { useState } from 'react';

interface Selection {
  questionId: number;
  selectedOption: 'A' | 'B' | 'C';
}

export function useSelections() {
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [questionChoices, setQuestionChoices] = useState<Record<number, 'A' | 'B' | 'C'>>({});

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

  const clearSelections = () => {
    setSelectedQuestions([]);
    setQuestionChoices({});
  };

  return {
    selectedQuestions,
    questionChoices,
    selectionCount,
    canSubmit,
    toggleSelection,
    getProgressWidth,
    getSelectedQuestionsWithChoices,
    clearSelections
  };
}
