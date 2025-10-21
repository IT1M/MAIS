'use client';

interface UserActivityHeatmapProps {
  data: Record<string, number>;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function UserActivityHeatmap({ data }: UserActivityHeatmapProps) {
  // Find max value for color scaling
  const maxValue = Math.max(...Object.values(data), 1);

  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-800';
    const intensity = Math.min(value / maxValue, 1);
    
    if (intensity < 0.25) return 'bg-blue-200 dark:bg-blue-900';
    if (intensity < 0.5) return 'bg-blue-400 dark:bg-blue-700';
    if (intensity < 0.75) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-800 dark:bg-blue-300';
  };

  const getValue = (day: number, hour: number) => {
    return data[`${day}-${hour}`] || 0;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        User Activity Heatmap
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Entry activity by day of week and hour of day
      </p>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hours header */}
          <div className="flex mb-1">
            <div className="w-12"></div>
            {HOURS.map(hour => (
              <div
                key={hour}
                className="w-8 text-xs text-center text-gray-500 dark:text-gray-400"
              >
                {hour % 3 === 0 ? hour : ''}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-xs text-gray-600 dark:text-gray-400 font-medium">
                {day}
              </div>
              {HOURS.map(hour => {
                const value = getValue(dayIndex, hour);
                return (
                  <div
                    key={hour}
                    className={`w-8 h-8 m-0.5 rounded ${getColor(value)} transition-colors cursor-pointer hover:ring-2 hover:ring-blue-500`}
                    title={`${day} ${hour}:00 - ${value} entries`}
                  />
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Less</span>
            <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800"></div>
            <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-900"></div>
            <div className="w-4 h-4 rounded bg-blue-400 dark:bg-blue-700"></div>
            <div className="w-4 h-4 rounded bg-blue-600 dark:bg-blue-500"></div>
            <div className="w-4 h-4 rounded bg-blue-800 dark:bg-blue-300"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
