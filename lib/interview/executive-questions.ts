export type ExecutiveInterviewQuestion = {
  id: number;
  question: string;
  sampleAnswer: string;
};

export const executiveInterviewTips = [
  "Speak in terms of business impact, not just responsibilities.",
  "Use measurable achievements whenever possible (e.g. increased revenue by 20%, reduced costs by R5 million).",
  "Structure responses using STAR: Situation, Task, Action, Result.",
  "Demonstrate strategic thinking and commercial awareness.",
  "Highlight leading change, managing risk, and developing people.",
  "Show confidence without sounding arrogant.",
  "Prepare examples covering leadership, conflict resolution, crisis management, stakeholder engagement, and innovation.",
];

export const executiveInterviewQuestions: ExecutiveInterviewQuestion[] = [
  {
    id: 1,
    question: "Tell us about yourself.",
    sampleAnswer:
      "I am a strategic leader with over 15 years of experience leading high-performing teams, improving operational efficiency, and delivering sustainable business growth. Throughout my career, I have focused on aligning business strategy with execution while building strong teams and maintaining excellent stakeholder relationships. I enjoy solving complex business challenges and creating environments where people and performance thrive.",
  },
  {
    id: 2,
    question: "Why should we hire you?",
    sampleAnswer:
      "I bring a combination of strategic leadership, financial discipline, operational excellence, and people management. I have consistently delivered measurable improvements in profitability, productivity, and employee engagement. Beyond experience, I believe my leadership style enables teams to perform at their best while keeping the organisation focused on achieving long-term objectives.",
  },
  {
    id: 3,
    question: "Describe your leadership style.",
    sampleAnswer:
      "My leadership style is collaborative, accountable, and results-driven. I believe in empowering people through trust, setting clear expectations, coaching employees, and creating accountability. I encourage innovation while ensuring alignment with organisational goals.",
  },
  {
    id: 4,
    question: "Tell us about a difficult decision you had to make.",
    sampleAnswer:
      "One of the most challenging decisions involved restructuring a department due to declining revenue. While it affected several employees, I ensured the process was transparent, legally compliant, and handled with empathy. We also redesigned workflows, resulting in a 25% improvement in efficiency and restoring profitability within six months.",
  },
  {
    id: 5,
    question: "How do you handle conflict among senior managers?",
    sampleAnswer:
      "I focus on understanding the underlying business issue rather than personalities. I facilitate open discussions, ensure everyone is heard, align conversations around organisational objectives, and encourage evidence-based decision-making. My role is to build consensus while maintaining accountability.",
  },
  {
    id: 6,
    question: "Describe a time you led organisational change.",
    sampleAnswer:
      "During a digital transformation initiative, I led the implementation of new systems across multiple departments. I developed a communication strategy, engaged key stakeholders, provided training, and monitored adoption. The project improved operational efficiency by over 30% and significantly reduced manual processes.",
  },
  {
    id: 7,
    question: "What is your greatest leadership achievement?",
    sampleAnswer:
      "I successfully turned around an underperforming business unit by improving customer service, restructuring operations, strengthening financial controls, and developing leadership within the team. Within 18 months, profitability increased by 40%, employee turnover declined, and customer satisfaction improved significantly.",
  },
  {
    id: 8,
    question: "How do you motivate senior teams?",
    sampleAnswer:
      "I believe executives are motivated by purpose, ownership, recognition, and opportunities to make meaningful contributions. I ensure leaders understand the strategic vision, have measurable objectives, receive regular feedback, and are empowered to make decisions.",
  },
  {
    id: 9,
    question: "Tell us about a time you failed.",
    sampleAnswer:
      "Early in my leadership career, I underestimated the importance of stakeholder communication during a major project. Although the technical implementation was successful, some stakeholders felt excluded. I learned that consistent communication is just as important as delivering results, and I now prioritise stakeholder engagement throughout every major initiative.",
  },
  {
    id: 10,
    question: "How do you make strategic decisions?",
    sampleAnswer:
      "I combine data analysis, financial information, market trends, risk assessment, and input from experienced leaders. Once I have sufficient information, I make timely decisions while remaining flexible enough to adjust if new information emerges.",
  },
  {
    id: 11,
    question: "How do you measure success?",
    sampleAnswer:
      "I measure success through business performance, customer satisfaction, employee engagement, innovation, operational efficiency, and long-term sustainability. Financial performance is important, but sustainable success requires strong people, effective processes, and satisfied customers.",
  },
  {
    id: 12,
    question: "Describe your experience managing budgets.",
    sampleAnswer:
      "I have managed multimillion-rand budgets, including forecasting, financial planning, cost optimisation, and investment decisions. I ensure resources are aligned with strategic priorities while maintaining strong financial governance and delivering value for shareholders.",
  },
  {
    id: 13,
    question: "How do you manage underperforming executives?",
    sampleAnswer:
      "I first seek to understand the root cause of the performance issue. I establish clear expectations, develop an improvement plan, provide coaching, and monitor progress. If performance does not improve despite support, I make difficult decisions in the best interest of the organisation.",
  },
  {
    id: 14,
    question: "How do you build high-performing teams?",
    sampleAnswer:
      "I recruit talented individuals, establish a culture of trust and accountability, encourage collaboration, recognise achievements, and invest in leadership development. High-performing teams thrive when expectations are clear and people feel valued.",
  },
  {
    id: 15,
    question: "How do you manage pressure?",
    sampleAnswer:
      "I remain calm by focusing on priorities, relying on accurate information, communicating openly, and making informed decisions. Pressure is part of executive leadership, and I believe maintaining composure gives confidence to the entire organisation.",
  },
  {
    id: 16,
    question: "Why are you leaving your current role?",
    sampleAnswer:
      "I'm proud of what I've accomplished in my current organisation. However, I'm looking for a new opportunity where I can contribute at a broader strategic level, take on larger leadership responsibilities, and continue growing professionally.",
  },
  {
    id: 17,
    question: "Where do you see yourself in five years?",
    sampleAnswer:
      "I see myself leading a successful organisation, contributing to long-term business strategy, mentoring future leaders, and helping the company achieve sustainable growth while delivering value to customers, employees, and shareholders.",
  },
  {
    id: 18,
    question: "What would your team say about you?",
    sampleAnswer:
      "They would describe me as approachable, fair, decisive, and supportive. I challenge people to perform at their best while providing the guidance and resources they need to succeed.",
  },
  {
    id: 19,
    question: "What are your biggest strengths?",
    sampleAnswer:
      "My biggest strengths are strategic thinking, executive leadership, financial management, change management, negotiation, stakeholder management, decision-making, building high-performing teams, risk management, and problem-solving.",
  },
  {
    id: 20,
    question: "Do you have any questions for us?",
    sampleAnswer:
      "Yes. What are the organisation's top strategic priorities over the next three years? What are the biggest challenges facing this role? How is executive performance measured, and what does success look like in the first 12 months?",
  },
];

const executiveRolePattern =
  /\b(ceo|coo|cfo|cto|cio|cmo|director|executive|general manager|managing director|head of|chief|vice president|\bvp\b|senior manager|finance director|hr director|operations executive|executive manager|group manager)\b/i;

export function isExecutiveRole(position: string) {
  return executiveRolePattern.test(position.trim());
}

export function questionsForDuration(durationMinutes: number) {
  const count =
    durationMinutes >= 60 ? 20 : durationMinutes >= 30 ? 12 : 6;
  return executiveInterviewQuestions.slice(0, count);
}

export function buildExecutiveQuestionPrompt(position: string, durationMinutes: number) {
  const questions = questionsForDuration(durationMinutes);
  const list = questions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join("\n");

  return `Executive interview question bank for ${position}:
Use these questions in order when appropriate. Adapt wording to the candidate's target role but keep the executive tone (business impact, leadership, measurable results).

${list}

Coaching rules for this session:
${executiveInterviewTips.map((t) => `- ${t}`).join("\n")}

When giving feedback after an answer, briefly note what worked, then suggest how to improve using STAR and measurable outcomes. For corrections, reference the sample answer style (strategic, concise, results-focused) without reading it verbatim unless the candidate struggled badly.`;
}

export function findExecutiveSampleAnswer(questionText: string) {
  const normalized = questionText.toLowerCase().replace(/[^\w\s]/g, " ").trim();
  if (!normalized) return null;

  let best: ExecutiveInterviewQuestion | null = null;
  let bestScore = 0;

  for (const item of executiveInterviewQuestions) {
    const q = item.question.toLowerCase().replace(/[^\w\s]/g, " ").trim();
    const words = q.split(/\s+/).filter((w) => w.length > 3);
    const hits = words.filter((w) => normalized.includes(w)).length;
    const score = hits / Math.max(words.length, 1);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return bestScore >= 0.35 ? best : null;
}

export function offlineExecutiveQuestionIndex(
  userTurnCount: number,
  durationMinutes: number,
) {
  const max = questionsForDuration(durationMinutes).length;
  return Math.min(userTurnCount, max - 1);
}

export function getOfflineExecutiveQuestion(
  userTurnCount: number,
  durationMinutes: number,
) {
  const index = offlineExecutiveQuestionIndex(userTurnCount, durationMinutes);
  return questionsForDuration(durationMinutes)[index] || executiveInterviewQuestions[0];
}
