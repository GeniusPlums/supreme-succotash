import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: string | Date;
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  return (
    <div className="flex justify-center space-x-4">
      <div className="text-center">
        <div className="bg-white text-blue-600 font-bold text-xl px-3 py-2 rounded-lg countdown-pulse">
          {formatTime(timeLeft.hours)}
        </div>
        <div className="text-xs text-blue-100 mt-1">Hours</div>
      </div>
      <div className="text-center">
        <div className="bg-white text-blue-600 font-bold text-xl px-3 py-2 rounded-lg countdown-pulse">
          {formatTime(timeLeft.minutes)}
        </div>
        <div className="text-xs text-blue-100 mt-1">Minutes</div>
      </div>
      <div className="text-center">
        <div className="bg-white text-blue-600 font-bold text-xl px-3 py-2 rounded-lg countdown-pulse">
          {formatTime(timeLeft.seconds)}
        </div>
        <div className="text-xs text-blue-100 mt-1">Seconds</div>
      </div>
    </div>
  );
}
