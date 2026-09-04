import { useState, useEffect } from "react";

const announcements = [
  "Make your academics smarter than your effort",
  "Buy a Project instead of Junkfood today — ₹20",
  "Free PDF downloads for all subjects available now"
];

export function Marquee() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm font-medium overflow-hidden whitespace-nowrap">
      <div 
        key={index}
        className="animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        {announcements[index]}
      </div>
    </div>
  );
}
