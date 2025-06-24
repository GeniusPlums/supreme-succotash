import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Home, RefreshCw, Trophy, Users, Clock } from "lucide-react";
import { useContest } from "@/hooks/use-contest";
import type { LeaderboardEntry } from "@shared/schema";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const { data: contest } = useContest();

  const { data: leaderboard, isLoading, refetch } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/contest/${contest?.id}/leaderboard`],
    enabled: !!contest?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">2</div>;
      case 3:
        return <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-sm font-bold text-orange-800">3</div>;
      default:
        return <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">{rank}</div>;
    }
  };

  const userRank = 23; // This would come from session/participant data
  const userPoints = 420;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setLocation('/contest')} className="mr-4 text-white hover:text-blue-200">
              <Home className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Leaderboard</h1>
              <p className="text-blue-100 text-sm">Live Rankings</p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User Rank Banner */}
      <div className="bg-gradient-to-r from-secondary to-orange-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-orange-100 text-sm">Your Rank</p>
              <p className="text-2xl font-bold">#{userRank}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-orange-100 text-sm">Your Points</p>
            <p className="text-2xl font-bold">{userPoints}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Top 3 Podium */}
        {leaderboard && leaderboard.length >= 3 && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
              Top 3 Champions
            </h2>
            <div className="flex justify-center items-end space-x-4 mb-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="bg-gray-300 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-gray-600">2</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 min-h-20">
                  <p className="font-semibold text-sm text-gray-800">Player #{leaderboard[1]?.participantId}</p>
                  <p className="text-xs text-gray-500">{leaderboard[1]?.points} pts</p>
                </div>
              </div>
              
              {/* 1st Place */}
              <div className="text-center">
                <div className="bg-yellow-400 rounded-full w-20 h-20 flex items-center justify-center mb-2 shadow-lg">
                  <Trophy className="w-8 h-8 text-yellow-800" />
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 min-h-24 border-2 border-yellow-300">
                  <p className="font-bold text-gray-800">Player #{leaderboard[0]?.participantId}</p>
                  <p className="text-sm text-yellow-700 font-semibold">{leaderboard[0]?.points} pts</p>
                  {leaderboard[0]?.points === 500 && (
                    <p className="text-xs text-yellow-600">Perfect Score!</p>
                  )}
                </div>
              </div>
              
              {/* 3rd Place */}
              <div className="text-center">
                <div className="bg-orange-400 rounded-full w-14 h-14 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-orange-800">3</span>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 min-h-20">
                  <p className="font-semibold text-sm text-gray-800">Player #{leaderboard[2]?.participantId}</p>
                  <p className="text-xs text-gray-500">{leaderboard[2]?.points} pts</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Rankings */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h3 className="font-bold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              All Rankings
            </h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {leaderboard?.map((entry) => (
              <div 
                key={entry.id} 
                className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 ${
                  entry.participantId === userRank ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div className="flex items-center">
                  {getRankIcon(entry.rank)}
                  <div className="ml-3">
                    <p className={`font-semibold ${
                      entry.participantId === userRank ? 'text-primary' : 'text-gray-800'
                    }`}>
                      {entry.participantId === userRank ? 'You (Current User)' : `Player #${entry.participantId}`}
                    </p>
                    <p className={`text-xs ${
                      entry.participantId === userRank ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {entry.correctPredictions}/5 correct predictions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    entry.participantId === userRank ? 'text-primary' : 'text-gray-800'
                  }`}>
                    {entry.points}
                  </p>
                  <p className={`text-xs ${
                    entry.participantId === userRank ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    points
                  </p>
                </div>
              </div>
            ))}
            
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Total participants: {contest?.totalParticipants}</p>
            </div>
          </div>
        </div>

        {/* Contest Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{contest?.totalParticipants}</p>
            <p className="text-sm text-gray-500">Total Players</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">2h 15m</p>
            <p className="text-sm text-gray-500">Time Left</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          <Button 
            onClick={handleRefresh} 
            className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh Results
          </Button>
          
          <Button 
            onClick={() => setLocation('/contest')} 
            variant="outline"
            className="w-full border-2 border-primary text-primary font-bold py-3 px-6 rounded-lg hover:bg-blue-50 transition-all duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Contest
          </Button>
        </div>
      </div>
    </div>
  );
}
