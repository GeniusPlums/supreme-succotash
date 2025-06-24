import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Lock, Edit, AlertTriangle } from "lucide-react";
import { useContest } from "@/hooks/use-contest";
import { useSelections } from "@/hooks/use-selections";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Question } from "@shared/schema";

export default function Confirmation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: contest } = useContest();
  const { selectedQuestions, getSelectedQuestionsWithChoices, clearSelections } = useSelections();

  // Early return for validation - this prevents the hook order issues
  if (selectedQuestions.length !== 5) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <p className="text-gray-600 mb-4">You must select exactly 5 questions</p>
          <Button onClick={() => setLocation('/opinion-selection')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>
        </div>
      </div>
    );
  }

  const { data: questions } = useQuery<Question[]>({
    queryKey: [`/api/contest/${contest?.id}/questions`],
    enabled: !!contest?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async (selections: any[]) => {
      const sessionId = localStorage.getItem('sessionId') || `session_${Date.now()}`;
      localStorage.setItem('sessionId', sessionId);

      // First join contest if not already joined
      const joinResponse = await apiRequest(`/api/contest/${contest?.id}/join`, {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          name: `Player_${Math.random().toString(36).substr(2, 6)}`
        })
      });
      const participant = await joinResponse.json();

      // Submit selections
      await apiRequest(`/api/participant/${participant.id}/selections`, {
        method: 'POST',
        body: JSON.stringify({
          selections: selections.map(s => ({
            questionId: s.questionId,
            selectedOption: s.selectedOption
          }))
        })
      });

      return participant;
    },
    onSuccess: () => {
      toast({
        title: "Predictions Submitted!",
        description: "Your picks have been locked in. Good luck!",
      });
      clearSelections();
      setLocation('/leaderboard');
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your picks. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (selectedQuestions.length !== 5) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <p className="text-gray-600 mb-4">You must select exactly 5 questions</p>
          <Button onClick={() => setLocation('/opinion-selection')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>
        </div>
      </div>
    );
  }

  const selectedQuestionsData = questions?.filter(q => selectedQuestions.includes(q.id)) || [];
  const selections = getSelectedQuestionsWithChoices();
  const maxPoints = selectedQuestionsData.length * 100;
  const averageExpected = Math.floor(maxPoints * 0.7);

  const handleConfirm = () => {
    if (selections.length === 5) {
      submitMutation.mutate(selections);
    }
  };

  const formatVotes = (votes: number) => {
    if (votes >= 1000) {
      return `${Math.floor(votes / 1000)}K votes`;
    }
    return `${votes} votes`;
  };

  const getOptionText = (question: Question, option: string) => {
    switch (option) {
      case 'A': return question.optionA;
      case 'B': return question.optionB;
      case 'C': return question.optionC;
      default: return '';
    }
  };

  const getOptionVotes = (question: Question, option: string) => {
    switch (option) {
      case 'A': return question.votesA;
      case 'B': return question.votesB;
      case 'C': return question.votesC;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center">
        <button onClick={() => setLocation('/opinion-selection')} className="mr-4 text-white hover:text-blue-200">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Confirm Your Picks</h1>
      </div>

      <div className="p-6">
        {/* Summary Header */}
        <div className="prize-gradient text-white rounded-xl p-6 mb-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">5 Opinions Selected</h2>
            <p className="text-green-100">Review your predictions before final submission</p>
          </div>
        </div>

        {/* Selected Opinions */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Your Selected Opinions:</h3>
          
          {selectedQuestionsData.map((question) => {
            const selection = selections.find(s => s.questionId === question.id);
            const selectedOption = selection?.selectedOption || 'A';
            
            return (
              <div key={question.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-primary text-white text-xs font-medium px-2 py-1 rounded-full mr-2">
                        Q{question.questionNumber}
                      </span>
                      <span className="text-xs text-gray-500">{question.category}</span>
                    </div>
                    <h4 className="font-medium text-gray-800 text-sm">{question.questionText}</h4>
                  </div>
                  <div className="ml-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      Your Pick: {selectedOption}. {getOptionText(question, selectedOption)}
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatVotes(getOptionVotes(question, selectedOption))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Points Summary */}
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-6 mb-6 border border-orange-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Potential Points
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{maxPoints}</div>
              <div className="text-sm text-gray-600">Max Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{averageExpected}</div>
              <div className="text-sm text-gray-600">Avg Expected</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">Points calculated based on question difficulty and your predictions</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleConfirm}
            disabled={submitMutation.isPending}
            className="w-full sports-gradient text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {submitMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Confirm & Lock-In
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => setLocation('/opinion-selection')} 
            variant="outline"
            className="w-full border-2 border-primary text-primary font-bold py-4 px-6 rounded-xl text-lg hover:bg-blue-50 transition-all duration-200"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Selections
          </Button>
        </div>

        {/* Warning Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-warning mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Important Note</p>
              <p className="text-xs text-yellow-700 mt-1">Once you confirm your picks, they cannot be changed. Make sure you're satisfied with your selections.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
