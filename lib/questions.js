// Question bank + grading rubric.
// Next step: move this into a Supabase table so you can add questions without deploying.

export const QUESTION_BANK = [
  {
    category: "Product strategy",
    questions: [
      "How would you double Grammarly's paid subscriber base?",
      "You're building an AI career coach. What's your go-to-market strategy?",
      "Should Samsung enter the cloud gaming market?",
      "What's the biggest long-term threat to YouTube, and how would you respond?",
      "How would you increase Airbnb bookings by 15% next year?",
      "Should Apple build a modular, repairable phone?",
      "Should Google enter the rideshare market?",
      "Should Spotify enter the audiobook hardware market?",
      "Netflix growth is flattening in the US. What would you do?",
      "How would you monetize Google Maps beyond ads?",
      "You're the PM for WhatsApp. Pitch your 3-year strategy.",
    ],
  },
  {
    category: "Product sense",
    questions: [
      "What's your favorite product and how would you improve it?",
      "What's a product you think is poorly designed? Why, and how would you fix it?",
      "Design a fridge for blind people.",
      "Design an alarm clock for deaf travelers.",
      "Design a product that helps people make friends in a new city.",
      "Design a grocery shopping experience for busy parents.",
      "How would you improve Instagram for creators?",
      "How would you improve the airport security experience?",
      "How would you improve the experience of visiting a museum?",
      "Pick a product you used today. Who is it for, and what job does it do?",
    ],
  },
  {
    category: "Analytical / execution",
    questions: [
      "Estimate how much the Empire State Building weighs.",
      "How many dentists are there in New York City?",
      "Instagram Stories engagement dropped 10% overnight. Investigate.",
      "TikTok's daily usage is declining. Diagnose why.",
      "Nike's online conversion rate dropped 15% this month. Walk me through your investigation.",
      "How would you set goals for Facebook Marketplace?",
      "Define success metrics for Instagram Reels.",
      "What metrics would you use to measure LinkedIn Events' success?",
      "Define success metrics for Uber's driver app.",
      "How would you A/B test a change to Google Maps?",
      "What are the top 3 variables that shape Uber's passenger pickup experience?",
      "How would you decide the optimal number of photos to show in a News Feed post?",
    ],
  },
  {
    category: "Leadership & drive",
    questions: [
      "Tell me about a time you led a product from start to finish.",
      "How innovative are you? Give me a concrete example.",
      "Tell me about a time you disagreed with an engineer.",
      "Describe a product decision you got wrong. What did you learn?",
      "How do you influence a team without authority?",
      "Tell me about the hardest stakeholder you've managed.",
      "Tell me about a time you solved a major customer pain point.",
      "Describe a time you made a short-term sacrifice for a long-term win.",
      "Tell me about a time you used data to change someone's mind.",
      "Why do you want to work at this company?",
    ],
  },
  {
    category: "Technical & AI",
    questions: [
      "How does a URL shortener work? Design one.",
      "What happens when you type a URL into a browser and press Enter?",
      "How would you add AI features to a docs product like Google Docs?",
      "Your team wants to add an LLM-powered feature. Build with an API or fine-tune your own model?",
      "You're the PM for an autonomous vehicle feature. How do you decide it's safe to ship?",
    ],
  },
];

export const RUBRIC = [
  "Communication",
  "Product vision",
  "Prioritization",
  "Business strategy",
  "Data literacy",
];
