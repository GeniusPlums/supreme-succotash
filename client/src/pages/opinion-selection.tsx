import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { useContest } from "@/hooks/use-contest";
import { useSelections } from "@/hooks/use-selections";
import type { Question } from "@shared/schema";

export default function OpinionSelection() {
  const [, setLocation] = useLocation();
  const { data: contest } = useContest();
  const { 
    selectedQuestions, 
    questionChoices,
    toggleSelection, 
    setQuestionChoice,
    canSubmit, 
    selectionCount,
    getProgressWidth 
  } = useSelections();

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: [`/api/contest/${contest?.id}/questions`],
    enabled: !!contest?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (canSubmit) {
      setLocation('/confirmation');
    }
  };

  const handleOptionClick = (questionId: number, option: 'A' | 'B' | 'C', e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedQuestions.includes(questionId)) {
      setQuestionChoice(questionId, option);
    } else if (selectedQuestions.length < 5) {
      toggleSelection(questionId, option);
    }
  };

  const formatVotes = (votes: number) => {
    if (votes >= 1000) {
      return `${Math.floor(votes / 1000)}K votes`;
    }
    return `${votes} votes`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={() => setLocation('/contest')} className="mr-4 text-white hover:text-blue-200">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Pick 5 out of 11</h1>
            <p className="text-blue-100 text-sm">Choose your winning opinions</p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
            <span className="font-bold">Selected {selectionCount}/5</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 border-b">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Progress</span>
          <span>{Math.round(getProgressWidth())}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="sports-gradient h-2 rounded-full transition-all duration-300" 
            style={{ width: `${getProgressWidth()}%` }}
          />
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Opinion Cards */}
        <div className="space-y-4">
          {questions?.map((question) => {
            const isSelected = selectedQuestions.includes(question.id);
            const selectedOption = questionChoices[question.id];
            
            return (
            <div
              key={question.id}
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 ${
                isSelected 
                  ? 'selection-glow bg-blue-50 border-primary' 
                  : 'hover:border-primary/30 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full mr-2 ${
                      isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      Q{question.questionNumber}
                    </span>
                    <span className="text-xs text-gray-500">{question.category}</span>
                    {isSelected && selectedOption && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Your pick: {selectedOption}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-relaxed">
                    {question.questionText}
                  </h3>
                </div>
                <div className="ml-3 flex flex-col items-center space-y-1">
                  {isSelected ? (
                    <>
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(question.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedQuestions.length < 5) {
                          toggleSelection(question.id, 'B');
                        } else {
                          alert('You can only select 5 questions maximum!');
                        }
                      }}
                      className={`w-6 h-6 border-2 border-dashed rounded-full flex items-center justify-center transition-colors ${
                        selectedQuestions.length < 5 
                          ? 'border-primary text-primary hover:bg-primary hover:text-white' 
                          : 'border-gray-300 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                {(['A', 'B', 'C'] as const).map((option) => {
                  const isQuestionSelected = selectedQuestions.includes(question.id);
                  const isOptionSelected = isQuestionSelected && questionChoices[question.id] === option;
                  const optionText = option === 'A' ? question.optionA : option === 'B' ? question.optionB : question.optionC;
                  const optionVotes = option === 'A' ? question.votesA : option === 'B' ? question.votesB : question.votesC;
                  
                  return (
                    <div 
                      key={option}
                      onClick={(e) => handleOptionClick(question.id, option, e)}
                      className={`option flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        isOptionSelected 
                          ? 'bg-primary text-white shadow-md' 
                          : isQuestionSelected
                            ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                            : 'bg-gray-50 hover:bg-blue-50'
                      }`}
                    >
                      <span className={`text-sm font-medium flex items-center ${
                        isOptionSelected ? 'text-white' : 'text-gray-700'
                      }`}>
                        {isOptionSelected && <Check className="w-4 h-4 mr-2" />}
                        {option}. {optionText}
                      </span>
                      <span className={`text-xs font-medium ${
                        isOptionSelected ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatVotes(optionVotes)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Submit Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t p-4">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 ${
            canSubmit 
              ? 'sports-gradient text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          {canSubmit ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Submit Picks (5/5 Selected)
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Submit Picks ({selectionCount}/5 Selected)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
