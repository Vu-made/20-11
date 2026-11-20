// Edit the class-trip pacing here; all durations are in seconds.
const TRIP_CONFIG = Object.freeze({
  studentCount: 5,
  initialOffset: 12,
  stages: [
    { name: 'outbound', duration: 44 },
    { name: 'disperse', duration: 6 },
    { name: 'play', duration: 36 },
    { name: 'gather', duration: 8 },
    { name: 'return', duration: 44 },
    { name: 'rest', duration: 8 },
    { name: 'lineup', duration: 8 }
  ],
  backpacks: ['#ad695a', '#638c9b', '#a49056', '#7e789f', '#6b8d70'],
  childHeights: [.69, .72, .67, .71, .68]
});
