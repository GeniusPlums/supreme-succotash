import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Trophy, Clock, Medal, Users, TrendingUp, Play } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sports-gradient text-white p-6 text-center">
        <div className="mb-4">
          <Trophy className="w-16 h-16 mx-auto mb-2" />
        </div>
        <h1 className="text-3xl font-bold mb-2">AuctoGames</h1>
        <p className="text-lg font-medium text-blue-100">Opinion 5</p>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center p-6">
        <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-8 mb-8 text-center border border-blue-100">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Sports Opinion Contest</h2>
          <p className="text-gray-600 text-lg mb-6">Pick 5 winning opinions from 11 sports questions and compete for amazing prizes!</p>
          
          {/* Key Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Clock className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Live Contests</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Medal className="w-6 h-6 text-warning mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Win Prizes</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Users className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Compete</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Leaderboard</p>
            </div>
          </div>

          <Button 
            onClick={() => setLocation('/contest')} 
            className="w-full sports-gradient text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Play className="w-5 h-5 mr-2" />
            Play Now
          </Button>
        </div>
      </div>
    </div>
  );
}
