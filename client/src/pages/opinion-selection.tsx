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
    toggleSelection, 
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
          {questions?.map((question) => (
            <div
              key={question.id}
              onClick={() => toggleSelection(question.id)}
              className={`bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer ${
                selectedQuestions.includes(question.id) 
                  ? 'selection-glow bg-blue-50' 
                  : 'hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full mr-2">
                      Q{question.questionNumber}
                    </span>
                    <span className="text-xs text-gray-500">{question.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-relaxed">
                    {question.questionText}
                  </h3>
                </div>
                <div className={`ml-3 transition-opacity duration-200 ${
                  selectedQuestions.includes(question.id) ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="option flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-150">
                  <span className="text-sm font-medium text-gray-700">A. {question.optionA}</span>
                  <span className="text-xs text-gray-500 font-medium">{formatVotes(question.votesA)}</span>
                </div>
                <div className="option flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-150">
                  <span className="text-sm font-medium text-gray-700">B. {question.optionB}</span>
                  <span className="text-xs text-gray-500 font-medium">{formatVotes(question.votesB)}</span>
                </div>
                <div className="option flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-150">
                  <span className="text-sm font-medium text-gray-700">C. {question.optionC}</span>
                  <span className="text-xs text-gray-500 font-medium">{formatVotes(question.votesC)}</span>
                </div>
              </div>
            </div>
          ))}
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
