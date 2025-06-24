import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, ClipboardCheck, AlertTriangle, CheckCircle, Calculator, Home, BarChart3 } from "lucide-react";
import { useContest } from "@/hooks/use-contest";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Question } from "@shared/schema";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: contest } = useContest();
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const { data: questions } = useQuery<Question[]>({
    queryKey: [`/api/contest/${contest?.id}/questions`],
    enabled: !!contest?.id,
  });

  const calculateMutation = useMutation({
    mutationFn: async () => {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        correctAnswer: answer
      }));

      if (answersArray.length !== questions?.length) {
        throw new Error('Please provide answers for all questions');
      }

      await apiRequest('POST', `/api/admin/contest/${contest?.id}/answers`, {
        answers: answersArray
      });

      await apiRequest('POST', `/api/admin/contest/${contest?.id}/calculate`);
    },
    onSuccess: () => {
      toast({
        title: "Scores Calculated!",
        description: "Leaderboard has been updated with the latest results.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/contest/${contest?.id}/leaderboard`] });
      setTimeout(() => setLocation('/leaderboard'), 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Failed",
        description: error.message || "There was an error calculating scores.",
        variant: "destructive",
      });
    }
  });

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleCalculate = () => {
    calculateMutation.mutate();
  };

  const allAnswersProvided = questions && Object.keys(answers).length === questions.length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-red-100 text-sm">Contest Management</p>
          </div>
          <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">ADMIN</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Admin Access</p>
              <p className="text-xs text-red-700 mt-1">This panel is for contest administrators only. Enter correct answers to calculate final scores.</p>
            </div>
          </div>
        </div>

        {/* Current Contest Info */}
        <div className="bg-white rounded-lg p-4 mb-6 border shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Current Contest</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Contest:</span>
              <span className="font-medium text-gray-800 ml-2">{contest?.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Participants:</span>
              <span className="font-medium text-gray-800 ml-2">{contest?.totalParticipants}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium ml-2">Active</span>
            </div>
            <div>
              <span className="text-gray-500">Prize:</span>
              <span className="font-medium text-gray-800 ml-2">{contest?.prize}</span>
            </div>
          </div>
        </div>

        {/* Answer Input Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <ClipboardCheck className="w-5 h-5 text-red-600 mr-2" />
            Input Correct Answers
          </h3>

          <div className="space-y-4">
            {questions?.map((question) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-full mr-2">
                        Q{question.questionNumber}
                      </span>
                      <span className="text-xs text-gray-500">{question.category}</span>
                    </div>
                    <h4 className="font-medium text-gray-800 text-sm">{question.questionText}</h4>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Options:</p>
                  <div className="space-y-1 text-sm text-gray-700 mb-3">
                    <div>A. {question.optionA}</div>
                    <div>B. {question.optionB}</div>
                    <div>C. {question.optionC}</div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {['A', 'B', 'C'].map((option) => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name={`q${question.id}_answer`} 
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="mr-2 text-red-600 focus:ring-red-500" 
                        />
                        <span className="text-sm font-medium text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleCalculate}
              disabled={!allAnswersProvided || calculateMutation.isPending}
              className="w-full bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-lg hover:bg-red-700 transition-all duration-200 shadow-lg disabled:bg-gray-400"
            >
              {calculateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate Scores & Update Leaderboard
                </>
              )}
            </Button>
            
            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button 
                onClick={() => setLocation('/leaderboard')} 
                variant="outline"
                className="border-2 border-red-600 text-red-600 font-bold py-3 px-4 rounded-lg hover:bg-red-50 transition-all duration-200"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
              <Button 
                onClick={() => setLocation('/contest')} 
                variant="outline"
                className="bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Contest
              </Button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-bold text-green-800 mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            System Status
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-green-600">Database:</span>
              <span className="text-green-800 font-medium ml-1">Connected</span>
            </div>
            <div>
              <span className="text-green-600">Questions:</span>
              <span className="text-green-800 font-medium ml-1">{questions?.length || 0} loaded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
