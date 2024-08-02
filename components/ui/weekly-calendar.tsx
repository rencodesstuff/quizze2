// components/WeeklyCalendar.tsx
import React from 'react';
import Link from 'next/link';

const WeeklyCalendar: React.FC = () => {
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(currentDay - currentDate.getDay() + i);
    return date.getDate();
  });

  return (
    <div className="flex flex-col items-center bg-gray-50 p-4 rounded-md shadow-lg">
      <div className="flex justify-between w-full mb-4">
        <div className="text-lg font-semibold">{`${currentMonth} ${currentYear}`}</div>
        <Link legacyBehavior href="/full-calendar">
          <a className="text-blue-500 text-sm">Show month &gt;</a>
        </Link>
      </div>
      <div className="flex justify-between w-full">
        {weekDays.map((day, index) => (
          <div key={day} className="flex flex-col items-center">
            <div className="text-xs text-gray-500">{day}</div>
            <div className={`mt-1 w-10 h-10 flex items-center justify-center rounded-full ${
              weekDates[index] === currentDay ? 'bg-blue-600 text-white' : 'text-gray-900'
            }`}>
              {weekDates[index]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
