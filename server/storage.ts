import { 
  contests, 
  questions, 
  participants, 
  leaderboard,
  type Contest, 
  type Question, 
  type Participant, 
  type LeaderboardEntry,
  type InsertContest, 
  type InsertQuestion, 
  type InsertParticipant,
  type InsertLeaderboardEntry 
} from "@shared/schema";

export interface IStorage {
  // Contest operations
  getActiveContest(): Promise<Contest | undefined>;
  createContest(contest: InsertContest): Promise<Contest>;
  updateContestParticipants(contestId: number, increment: number): Promise<void>;

  // Question operations
  getQuestionsByContest(contestId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestionAnswers(questionId: number, correctAnswer: string): Promise<void>;
  bulkUpdateAnswers(answers: {questionId: number, correctAnswer: string}[]): Promise<void>;

  // Participant operations
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipantBySession(sessionId: string): Promise<Participant | undefined>;
  updateParticipantSelections(participantId: number, selections: any[], totalPoints?: number): Promise<void>;

  // Leaderboard operations
  getLeaderboard(contestId: number): Promise<LeaderboardEntry[]>;
  updateLeaderboard(contestId: number): Promise<void>;
  getParticipantRank(participantId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private contests: Map<number, Contest> = new Map();
  private questions: Map<number, Question> = new Map();
  private participants: Map<number, Participant> = new Map();
  private leaderboardEntries: Map<number, LeaderboardEntry> = new Map();
  
  private contestIdCounter = 1;
  private questionIdCounter = 1;
  private participantIdCounter = 1;
  private leaderboardIdCounter = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create active contest
    const contest: Contest = {
      id: 1,
      name: "Opinion 5 - Sports Edition",
      description: "Pick 5 winning opinions from 11 sports questions",
      prize: "₹1,000",
      startTime: new Date(),
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      isActive: true,
      totalParticipants: 247
    };
    this.contests.set(1, contest);
    this.contestIdCounter = 2;

    // Create questions
    const questionsData = [
      {
        contestId: 1,
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
        contestId: 1,
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
        contestId: 1,
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
        contestId: 1,
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
        contestId: 1,
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
        contestId: 1,
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
        contestId: 1,
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
        contestId: 1,
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
        contestId: 1,
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
        contestId: 1,
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
        contestId: 1,
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

    questionsData.forEach((q, index) => {
      const question: Question = {
        id: index + 1,
        ...q,
        correctAnswer: null
      };
      this.questions.set(index + 1, question);
    });
    this.questionIdCounter = 12;

    // Create some sample leaderboard entries
    const sampleParticipants = [
      { name: "SportsMaster", points: 500, correctPredictions: 5 },
      { name: "Sarah_K", points: 485, correctPredictions: 5 },
      { name: "Mike_99", points: 465, correctPredictions: 4 },
      { name: "Alex_Sports", points: 440, correctPredictions: 4 },
      { name: "Jenny_B", points: 435, correctPredictions: 4 }
    ];

    sampleParticipants.forEach((p, index) => {
      const entry: LeaderboardEntry = {
        id: index + 1,
        contestId: 1,
        participantId: index + 1,
        rank: index + 1,
        points: p.points,
        correctPredictions: p.correctPredictions
      };
      this.leaderboardEntries.set(index + 1, entry);
    });
    this.leaderboardIdCounter = 6;
  }

  async getActiveContest(): Promise<Contest | undefined> {
    return Array.from(this.contests.values()).find(c => c.isActive);
  }

  async createContest(contest: InsertContest): Promise<Contest> {
    const id = this.contestIdCounter++;
    const newContest: Contest = { ...contest, id, totalParticipants: 0 };
    this.contests.set(id, newContest);
    return newContest;
  }

  async updateContestParticipants(contestId: number, increment: number): Promise<void> {
    const contest = this.contests.get(contestId);
    if (contest) {
      contest.totalParticipants += increment;
      this.contests.set(contestId, contest);
    }
  }

  async getQuestionsByContest(contestId: number): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(q => q.contestId === contestId)
      .sort((a, b) => a.questionNumber - b.questionNumber);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.questionIdCounter++;
    const newQuestion: Question = { 
      ...question, 
      id, 
      votesA: 30000, 
      votesB: 50000, 
      votesC: 70000,
      correctAnswer: null 
    };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async updateQuestionAnswers(questionId: number, correctAnswer: string): Promise<void> {
    const question = this.questions.get(questionId);
    if (question) {
      question.correctAnswer = correctAnswer;
      this.questions.set(questionId, question);
    }
  }

  async bulkUpdateAnswers(answers: {questionId: number, correctAnswer: string}[]): Promise<void> {
    for (const answer of answers) {
      await this.updateQuestionAnswers(answer.questionId, answer.correctAnswer);
    }
  }

  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const id = this.participantIdCounter++;
    const newParticipant: Participant = { 
      ...participant, 
      id, 
      totalPoints: 0,
      rank: null,
      submittedAt: null
    };
    this.participants.set(id, newParticipant);
    return newParticipant;
  }

  async getParticipantBySession(sessionId: string): Promise<Participant | undefined> {
    return Array.from(this.participants.values()).find(p => p.sessionId === sessionId);
  }

  async updateParticipantSelections(participantId: number, selections: any[], totalPoints?: number): Promise<void> {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.selections = selections;
      participant.submittedAt = new Date();
      if (totalPoints !== undefined) {
        participant.totalPoints = totalPoints;
      }
      this.participants.set(participantId, participant);
    }
  }

  async getLeaderboard(contestId: number): Promise<LeaderboardEntry[]> {
    return Array.from(this.leaderboardEntries.values())
      .filter(entry => entry.contestId === contestId)
      .sort((a, b) => a.rank - b.rank);
  }

  async updateLeaderboard(contestId: number): Promise<void> {
    // Calculate scores for all participants who have submitted
    const contestParticipants = Array.from(this.participants.values())
      .filter(p => p.contestId === contestId && p.selections);

    const questions = await this.getQuestionsByContest(contestId);
    
    for (const participant of contestParticipants) {
      let points = 0;
      let correctPredictions = 0;
      
      if (participant.selections && Array.isArray(participant.selections)) {
        for (const selection of participant.selections) {
          const question = questions.find(q => q.id === selection.questionId);
          if (question && question.correctAnswer === selection.selectedOption) {
            correctPredictions++;
            points += 100; // 100 points per correct answer
          }
        }
      }
      
      participant.totalPoints = points;
      this.participants.set(participant.id, participant);
    }

    // Update leaderboard entries
    const sortedParticipants = contestParticipants
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

    sortedParticipants.forEach((participant, index) => {
      const rank = index + 1;
      participant.rank = rank;
      
      const existingEntry = Array.from(this.leaderboardEntries.values())
        .find(entry => entry.participantId === participant.id);
      
      if (existingEntry) {
        existingEntry.rank = rank;
        existingEntry.points = participant.totalPoints || 0;
        this.leaderboardEntries.set(existingEntry.id, existingEntry);
      } else {
        const newEntry: LeaderboardEntry = {
          id: this.leaderboardIdCounter++,
          contestId,
          participantId: participant.id,
          rank,
          points: participant.totalPoints || 0,
          correctPredictions: 0 // Calculate this based on selections
        };
        this.leaderboardEntries.set(newEntry.id, newEntry);
      }
    });
  }

  async getParticipantRank(participantId: number): Promise<number> {
    const participant = this.participants.get(participantId);
    return participant?.rank || 0;
  }
}

export const storage = new MemStorage();
