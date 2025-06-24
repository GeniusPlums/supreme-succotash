import { db } from "./db";
import { contests, questions, leaderboard } from "@shared/schema";

async function initializeDatabase() {
  console.log("Initializing database with contest data...");

  try {
    // Check if contest already exists
    const existingContest = await db.select().from(contests).limit(1);
    if (existingContest.length > 0) {
      console.log("Contest data already exists, skipping initialization");
      return;
    }

    // Create the active contest
    const [contest] = await db.insert(contests).values({
      name: "Opinion 5 - Sports Edition",
      description: "Pick 5 winning opinions from 11 sports questions",
      prize: "₹1,000",
      startTime: new Date(),
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      isActive: true,
      totalParticipants: 247
    }).returning();

    console.log("Created contest:", contest.name);

    // Create the 11 sports questions
    const questionsData = [
      {
        contestId: contest.id,
        questionNumber: 1,
        category: "Football",
        questionText: "Which team will have the most possession in today's match?",
        optionA: "Manchester United",
        optionB: "Liverpool FC", 
        optionC: "Draw/Equal",
        votesA: 30000,
        votesB: 50000,
        votesC: 70000
      },
      {
        contestId: contest.id,
        questionNumber: 2,
        category: "Basketball",
        questionText: "Who will score the most 3-pointers in tonight's NBA game?",
        optionA: "Stephen Curry",
        optionB: "Damian Lillard",
        optionC: "Klay Thompson",
        votesA: 85000,
        votesB: 42000,
        votesC: 63000
      },
      {
        contestId: contest.id,
        questionNumber: 3,
        category: "Tennis",
        questionText: "Which surface will have the longest rally in today's tennis matches?",
        optionA: "Clay Court",
        optionB: "Hard Court",
        optionC: "Grass Court",
        votesA: 95000,
        votesB: 28000,
        votesC: 15000
      },
      {
        contestId: contest.id,
        questionNumber: 4,
        category: "Cricket",
        questionText: "Which batting position will score the most runs today?",
        optionA: "Opening Batsmen (1-2)",
        optionB: "Middle Order (3-6)",
        optionC: "Lower Order (7-11)",
        votesA: 67000,
        votesB: 88000,
        votesC: 23000
      },
      {
        contestId: contest.id,
        questionNumber: 5,
        category: "Soccer",
        questionText: "Which league will have the most goals scored this weekend?",
        optionA: "Premier League",
        optionB: "La Liga",
        optionC: "Serie A",
        votesA: 72000,
        votesB: 54000,
        votesC: 38000
      },
      {
        contestId: contest.id,
        questionNumber: 6,
        category: "Baseball",
        questionText: "Which team will hit the most home runs today?",
        optionA: "New York Yankees",
        optionB: "Los Angeles Dodgers",
        optionC: "Houston Astros",
        votesA: 45000,
        votesB: 67000,
        votesC: 52000
      },
      {
        contestId: contest.id,
        questionNumber: 7,
        category: "Hockey",
        questionText: "Which position will score the most goals tonight?",
        optionA: "Center",
        optionB: "Winger",
        optionC: "Defenseman",
        votesA: 58000,
        votesB: 76000,
        votesC: 21000
      },
      {
        contestId: contest.id,
        questionNumber: 8,
        category: "Golf",
        questionText: "Which type of shot will be most successful today?",
        optionA: "Driving",
        optionB: "Putting",
        optionC: "Chipping",
        votesA: 34000,
        votesB: 89000,
        votesC: 41000
      },
      {
        contestId: contest.id,
        questionNumber: 9,
        category: "Racing",
        questionText: "Which car manufacturer will dominate the race?",
        optionA: "Mercedes",
        optionB: "Ferrari",
        optionC: "Red Bull",
        votesA: 56000,
        votesB: 43000,
        votesC: 78000
      },
      {
        contestId: contest.id,
        questionNumber: 10,
        category: "Swimming",
        questionText: "Which stroke will have the fastest time today?",
        optionA: "Freestyle",
        optionB: "Butterfly",
        optionC: "Backstroke",
        votesA: 91000,
        votesB: 32000,
        votesC: 27000
      },
      {
        contestId: contest.id,
        questionNumber: 11,
        category: "Athletics",
        questionText: "Which event will have the closest finish?",
        optionA: "100m Sprint",
        optionB: "Marathon",
        optionC: "Long Jump",
        votesA: 64000,
        votesB: 47000,
        votesC: 33000
      }
    ];

    await db.insert(questions).values(questionsData);
    console.log("Created 11 sports questions");

    // Create sample leaderboard entries
    const sampleLeaderboard = [
      { contestId: contest.id, participantId: 1, rank: 1, points: 500, correctPredictions: 5 },
      { contestId: contest.id, participantId: 2, rank: 2, points: 485, correctPredictions: 5 },
      { contestId: contest.id, participantId: 3, rank: 3, points: 465, correctPredictions: 4 },
      { contestId: contest.id, participantId: 4, rank: 4, points: 440, correctPredictions: 4 },
      { contestId: contest.id, participantId: 5, rank: 5, points: 435, correctPredictions: 4 }
    ];

    await db.insert(leaderboard).values(sampleLeaderboard);
    console.log("Created sample leaderboard");

    console.log("Database initialization complete!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to initialize database:", error);
      process.exit(1);
    });
}

export { initializeDatabase };