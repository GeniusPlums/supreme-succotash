import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Brain, Calendar, Gift, Clock, Users, HelpCircle, Lightbulb, Flag } from "lucide-react";
import CountdownTimer from "@/components/countdown-timer";
import { useContest } from "@/hooks/use-contest";

export default function Contest() {
  const [, setLocation] = useLocation();
  const { data: contest, isLoading } = useContest();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No active contest found</p>
          <Button onClick={() => setLocation('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with back button */}
      <div className="bg-primary text-white p-4 flex items-center">
        <button onClick={() => setLocation('/')} className="mr-4 text-white hover:text-blue-200">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Current Contest</h1>
      </div>

      <div className="p-6">
        {/* Live Contest Card */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{contest.name}</h2>
                <p className="text-blue-100">{contest.description}</p>
              </div>
            </div>
            <div className="bg-red-500 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              LIVE
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <div className="flex items-center text-sm text-blue-100 mb-1">
                <Calendar className="w-4 h-4 mr-2" />
                Date
              </div>
              <p className="font-bold">{new Date().toLocaleDateString('en-GB')}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <div className="flex items-center text-sm text-blue-100 mb-1">
                <Gift className="w-4 h-4 mr-2" />
                Prize
              </div>
              <p className="font-bold text-yellow-300">{contest.prize}</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
            <div className="flex items-center text-sm text-blue-100 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              Contest Ends
            </div>
            <CountdownTimer endTime={contest.endTime} />
          </div>

          <Button 
            onClick={() => setLocation('/opinion-selection')} 
            className="w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:bg-gray-50"
          >
            <Flag className="w-5 h-5 mr-2" />
            Join Contest
          </Button>
        </div>

        {/* Contest Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{contest.totalParticipants}</p>
              <p className="text-sm text-gray-500">Participants</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-center">
              <HelpCircle className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">11</p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 text-warning mr-2" />
            How to Play
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
              <p className="text-gray-600">Pick exactly 5 questions from 11 available sports opinions</p>
            </div>
            <div className="flex items-start">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
              <p className="text-gray-600">Choose the option (A, B, or C) you think is most popular</p>
            </div>
            <div className="flex items-start">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
              <p className="text-gray-600">Earn points based on correct predictions and climb the leaderboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
