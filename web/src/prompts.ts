const PROMPTS: string[] = [
  "What are you grateful for today?",
  "Describe a moment that made you smile.",
  "What challenged you today and how did you handle it?",
  "Write about someone who made a difference in your life recently.",
  "What is one thing you learned today?",
  "If you could relive one moment from today, which would it be?",
  "What are your top three priorities for tomorrow?",
  "Describe your ideal day. How close was today?",
  "What emotion dominated your day and why?",
  "Write a letter to your future self.",
  "What is a habit you want to build or break?",
  "Describe a place that makes you feel at peace.",
  "What is something you have been putting off? Why?",
  "Write about a fear you overcame or want to overcome.",
  "What does success look like to you right now?",
  "Describe a conversation that stuck with you today.",
  "What would you do if you knew you could not fail?",
  "Write about a book, song, or movie that resonated with you.",
  "What boundaries do you need to set or reinforce?",
  "Describe your happiest memory from the past week.",
  "What advice would you give to your younger self?",
  "Write about something you are proud of accomplishing.",
  "What relationships are you nurturing right now?",
  "Describe a small act of kindness you witnessed or performed.",
  "What does your inner critic say? How can you respond with compassion?",
  "Write about a goal you are working toward.",
  "What brings you energy? What drains it?",
  "Describe something beautiful you noticed today.",
  "What are you looking forward to?",
  "Free write for five minutes without stopping. Let your thoughts flow.",
];

export function getDailyPrompt(dateStr: string): string {
  // Use day-of-year to rotate through prompts
  const date = new Date(dateStr + "T00:00:00");
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % PROMPTS.length;
  return PROMPTS[index] ?? PROMPTS[0]!;
}
