export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
};

export const user = {
  name: "Student",
  email: "student@scholar.ai",
  initials: "S",
  level: 1,
  xp: 1420,
  xpToNext: 2000,
  streak: 7,
  studyHours: 128,
};

export const dashboardStats = [
  { label: "Questions Asked", value: 348, suffix: "", trend: "+12 this week", tone: "primary" },
  { label: "Questions Solved", value: 331, suffix: "", trend: "95% resolution", tone: "success" },
  { label: "Accuracy", value: 94, suffix: "%", trend: "+3% vs last week", tone: "accent" },
  { label: "Study Streak", value: 14, suffix: " days", trend: "Personal best", tone: "warning" },
  { label: "Time Studied", value: 128, suffix: " hrs", trend: "8h this week", tone: "secondary" },
];

export const weeklyProgress = [
  { day: "Mon", minutes: 65 },
  { day: "Tue", minutes: 90 },
  { day: "Wed", minutes: 45 },
  { day: "Thu", minutes: 120 },
  { day: "Fri", minutes: 80 },
  { day: "Sat", minutes: 150 },
  { day: "Sun", minutes: 70 },
];

export const suggestedQuestions = [
  { title: "Explain Newton's Laws", subject: "Physics" },
  { title: "Solve Integration by parts", subject: "Mathematics" },
  { title: "Python Loops explained", subject: "Programming" },
  { title: "Binary Search walkthrough", subject: "DSA" },
  { title: "Operating System scheduling", subject: "CS Core" },
  { title: "Data Structures overview", subject: "DSA" },
];

export const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "ai",
    text: "Hi Aarav! I'm your AI study partner. Ask me anything — concepts, numericals, code or exam strategy.",
    time: "09:12",
  },
];

export const mockAnswer = (q: string) =>
  `Great question about "${q}".\n\nHere's the short version:\n\n1. Start from the core definition and identify what is given vs. what is asked.\n2. Apply the governing rule step by step, keeping units and assumptions explicit.\n3. Verify the result with a quick sanity check or a limiting case.\n\nTip: try re-explaining this in your own words — teaching it back is the fastest way to lock it in.`;

export const savedAnswers = [
  { id: "1", subject: "Physics", question: "Derive the equation of motion v = u + at", answer: "Using a = dv/dt, integrating from t=0 to t gives v - u = at, hence v = u + at.", date: "12 Mar 2026" },
  { id: "2", subject: "Mathematics", question: "Integration by parts with examples", answer: "Formula: ∫ u dv = uv - ∫ v du. Choose u using ILATE rule.", date: "10 Mar 2026" },
  { id: "3", subject: "DSA", question: "Time complexity of binary search", answer: "O(log n) time complexity because search space is halved in each step.", date: "08 Mar 2026" },
  { id: "4", subject: "Programming", question: "Difference between list and tuple in Python", answer: "Lists are mutable [], while tuples are immutable (). Tuples are faster and hashable.", date: "05 Mar 2026" },
  { id: "5", subject: "Chemistry", question: "Explain Le Chatelier's principle", answer: "If a dynamic equilibrium is disturbed, the position of equilibrium moves to counteract the change.", date: "02 Mar 2026" },
  { id: "6", subject: "CS Core", question: "Round robin CPU scheduling example", answer: "Preemptive scheduling using fixed time quantum for process execution.", date: "28 Feb 2026" },
];

export const chatHistory = [
  { id: "h1", title: "Thermodynamics first law doubts", subject: "Physics", date: "Today", messages: 12, favorite: true },
  { id: "h2", title: "Definite integrals practice set", subject: "Mathematics", date: "Yesterday", messages: 8, favorite: false },
  { id: "h3", title: "Graph traversal: BFS vs DFS", subject: "DSA", date: "2 days ago", messages: 21, favorite: true },
  { id: "h4", title: "Normalization in DBMS", subject: "CS Core", date: "Last week", messages: 6, favorite: false },
  { id: "h5", title: "Organic reaction mechanisms", subject: "Chemistry", date: "Last week", messages: 15, favorite: false },
];

export const chapters = [
  { name: "1. Introduction to Kinematics", pages: "1 – 14", summary: "Displacement, velocity and acceleration fundamentals." },
  { name: "2. Laws of Motion", pages: "15 – 32", summary: "Newton's three laws with solved numericals." },
  { name: "3. Work, Energy & Power", pages: "33 – 48", summary: "Work-energy theorem and conservation principles." },
  { name: "4. Rotational Dynamics", pages: "49 – 70", summary: "Torque, moment of inertia and angular momentum." },
];

export const ocrText = `Q3. A body of mass 5 kg is moving with a velocity of 10 m/s.
Calculate the kinetic energy of the body.

Given: m = 5 kg, v = 10 m/s
K.E. = 1/2 mv² = 1/2 × 5 × 100 = 250 J`;

export const badges = [
  { name: "Streak Master", desc: "14-day study streak", emoji: "🔥" },
  { name: "Quiz Champion", desc: "Scored 100% on 5 quizzes", emoji: "🏆" },
  { name: "Night Owl", desc: "20 late-night sessions", emoji: "🦉" },
  { name: "Curious Mind", desc: "Asked 300+ questions", emoji: "💡" },
  { name: "Fast Learner", desc: "50 topics completed", emoji: "⚡" },
  { name: "Consistency", desc: "8 weeks active", emoji: "📅" },
];

export const leaderboard = [
  { rank: 1, name: "Meera Iyer", xp: 4120 },
  { rank: 2, name: "Rohan Gupta", xp: 3480 },
  { rank: 3, name: "Aarav Sharma", xp: 2450, isYou: true },
  { rank: 4, name: "Sana Khan", xp: 2210 },
  { rank: 5, name: "Dev Patel", xp: 1980 },
];

export const quizQuestions = [
  {
    q: "Newton's second law relates force to which two quantities?",
    options: ["Mass and acceleration", "Mass and velocity", "Energy and time", "Momentum and distance"],
    answer: 0,
  },
  {
    q: "The SI unit of work is:",
    options: ["Newton", "Joule", "Watt", "Pascal"],
    answer: 1,
  },
  {
    q: "Binary search requires the input array to be:",
    options: ["Unsorted", "Sorted", "Circular", "Hashed"],
    answer: 1,
  },
  {
    q: "Which data structure uses FIFO ordering?",
    options: ["Stack", "Tree", "Queue", "Heap"],
    answer: 2,
  },
  {
    q: "In Python, which keyword defines a function?",
    options: ["func", "define", "def", "fn"],
    answer: 2,
  },
];