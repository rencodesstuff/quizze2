// components/ui/calendar.tsx
import React from 'react';

export const Calendar: React.FC = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateCalendar = () => {
    let calendar = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      let week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(<td key={`empty-${j}`} className="p-2"></td>);
        } else if (day > daysInMonth) {
          break;
        } else {
          week.push(
            <td key={`day-${day}`} className={`p-2 text-center ${day === currentDate.getDate() ? 'bg-blue-500 text-white rounded-full' : ''}`}>
              {day}
            </td>
          );
          day++;
        }
      }
      calendar.push(<tr key={`week-${i}`}>{week}</tr>);
      if (day > daysInMonth) break;
    }

    return calendar;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-xl font-bold mb-4">{`${currentMonth} ${currentYear}`}</div>
      <table className="w-full">
        <thead>
          <tr>
            {days.map(day => (
              <th key={day} className="p-2 text-center">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {generateCalendar()}
        </tbody>
      </table>
    </div>
  );
};