export type InterviewQuestion = {
  slug: string;
  prompt: string;
  whyAsking?: string;
  sampleAnswer: string;
  category: "general" | "behavioural" | "closing";
  sortOrder: number;
};

export const INTERVIEW_DURATIONS = [15, 30, 60] as const;
export type InterviewDuration = (typeof INTERVIEW_DURATIONS)[number];

export function questionCountForDuration(minutes: InterviewDuration): number {
  if (minutes === 15) return 5;
  if (minutes === 30) return 8;
  return 15;
}

/** Curated bank — mirrors content used for coaching and scoring. */
export const interviewQuestionBank: InterviewQuestion[] = [
  {
    slug: "tell-me-about-yourself",
    prompt: "Tell me about yourself.",
    whyAsking:
      "They want a brief summary of your professional background, not your life story.",
    sampleAnswer:
      "I am a dedicated and results-driven professional with over five years of experience in administration and customer service. Throughout my career, I have developed strong communication, problem-solving, and organisational skills. I enjoy working in fast-paced environments where I can contribute to team success while continuously learning and growing. I'm excited about this opportunity because it aligns with my skills and career goals.",
    category: "general",
    sortOrder: 1,
  },
  {
    slug: "why-this-company",
    prompt: "Why do you want to work for our company?",
    sampleAnswer:
      "I've researched your company and I'm impressed by your reputation, values, and commitment to excellence. I believe this role matches my experience and provides an opportunity for me to contribute while continuing to develop professionally.",
    category: "general",
    sortOrder: 2,
  },
  {
    slug: "why-hire-you",
    prompt: "Why should we hire you?",
    sampleAnswer:
      "I bring the right combination of experience, technical skills, and a positive attitude. I learn quickly, work well under pressure, and enjoy solving problems. I'm confident I can add value from day one while continuing to grow within the organisation.",
    category: "general",
    sortOrder: 3,
  },
  {
    slug: "strengths",
    prompt: "What are your strengths?",
    sampleAnswer:
      "One of my greatest strengths is my ability to stay organised while managing multiple priorities. I'm also a strong communicator, a quick learner, and I enjoy collaborating with others to achieve shared goals.",
    category: "general",
    sortOrder: 4,
  },
  {
    slug: "weakness",
    prompt: "What is your biggest weakness?",
    sampleAnswer:
      "Earlier in my career, I sometimes struggled with delegating tasks because I wanted everything done perfectly. I've learned that trusting colleagues and communicating clearly leads to better teamwork and improved productivity.",
    category: "general",
    sortOrder: 5,
  },
  {
    slug: "difficult-problem",
    prompt: "Tell me about a time you solved a difficult problem.",
    whyAsking: "Use the STAR method: Situation, Task, Action, Result.",
    sampleAnswer:
      "Situation: A client was unhappy because an order had been delayed. Task: I needed to resolve the issue while maintaining customer satisfaction. Action: I contacted the client immediately, explained the situation honestly, arranged an alternative solution, and kept them updated throughout the process. Result: The client appreciated the communication and continued doing business with the company.",
    category: "behavioural",
    sortOrder: 6,
  },
  {
    slug: "workplace-conflict",
    prompt: "Describe a conflict you had at work.",
    sampleAnswer:
      "A colleague and I had different opinions on how to complete a project. Instead of arguing, we discussed our ideas, listened to each other's perspectives, and agreed on the best solution. The project was completed successfully, and our working relationship became stronger.",
    category: "behavioural",
    sortOrder: 7,
  },
  {
    slug: "five-years",
    prompt: "Where do you see yourself in five years?",
    sampleAnswer:
      "In five years, I hope to have developed my expertise, taken on greater responsibilities, and contributed significantly to the organisation's success. I also hope to mentor others and continue growing professionally.",
    category: "general",
    sortOrder: 8,
  },
  {
    slug: "left-previous-job",
    prompt: "Why did you leave your previous job?",
    sampleAnswer:
      "I appreciated the experience and everything I learned there. However, I'm looking for a new opportunity that offers greater professional growth and allows me to use my skills in a more challenging environment.",
    category: "general",
    sortOrder: 9,
  },
  {
    slug: "handle-pressure",
    prompt: "How do you handle pressure?",
    sampleAnswer:
      "I remain calm by prioritising tasks, planning my work, and focusing on finding solutions rather than dwelling on problems. I find that good organisation helps me perform well under pressure.",
    category: "general",
    sortOrder: 10,
  },
  {
    slug: "made-a-mistake",
    prompt: "Tell me about a time you made a mistake.",
    sampleAnswer:
      "I once overlooked an important detail in a report. As soon as I realised it, I informed my manager, corrected the mistake immediately, and introduced a checklist to prevent similar errors. Since then, my accuracy has improved significantly.",
    category: "behavioural",
    sortOrder: 11,
  },
  {
    slug: "prioritise-work",
    prompt: "How do you prioritise your work?",
    sampleAnswer:
      "I assess deadlines, urgency, and business impact. I create a task list, prioritise the most critical activities first, and regularly review my progress to ensure everything stays on track.",
    category: "general",
    sortOrder: 12,
  },
  {
    slug: "team-player",
    prompt: "Are you a team player?",
    sampleAnswer:
      "Absolutely. I enjoy collaborating with others, sharing ideas, and supporting colleagues. I believe strong teamwork leads to better outcomes and a more positive work environment.",
    category: "general",
    sortOrder: 13,
  },
  {
    slug: "looking-for-new-job",
    prompt: "Why are you looking for a new job?",
    sampleAnswer:
      "I'm looking for new challenges, opportunities to develop my skills, and a role where I can make a meaningful contribution while continuing to grow professionally.",
    category: "general",
    sortOrder: 14,
  },
  {
    slug: "questions-for-us",
    prompt: "Do you have any questions for us?",
    whyAsking: "Always ask thoughtful questions.",
    sampleAnswer:
      "Yes — What does success look like in this role? What training opportunities do you offer? What are the biggest challenges someone in this position will face? What do you enjoy most about working here? What are the next steps in the recruitment process?",
    category: "closing",
    sortOrder: 15,
  },
];

export function pickQuestionsForDuration(
  minutes: InterviewDuration,
): InterviewQuestion[] {
  const count = questionCountForDuration(minutes);
  return interviewQuestionBank.slice(0, count);
}

export const interviewTips = [
  "Research the company before the interview.",
  "Read the job description carefully.",
  "Dress professionally.",
  "Arrive 10–15 minutes early.",
  "Maintain eye contact and smile.",
  "Listen carefully before answering.",
  "Use examples from your experience.",
  "Keep answers concise and relevant.",
  "Thank the interviewer for their time.",
];
