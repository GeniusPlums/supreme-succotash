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
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Contest operations
  getActiveContest(): Promise<Contest | undefined>;
  getAllContests(): Promise<Contest[]>;
  createContest(contest: InsertContest): Promise<Contest>;
  updateContest(id: number, contest: Partial<InsertContest>): Promise<Contest>;
  updateContestParticipants(contestId: number, increment: number): Promise<void>;

  // Question operations
  getQuestionsByContest(contestId: number): Promise<Question[]>;
  getAllQuestions(): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(id: number): Promise<void>;
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



// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  async getActiveContest(): Promise<Contest | undefined> {
    const [contest] = await db.select().from(contests).where(eq(contests.isActive, true));
    return contest || undefined;
  }

  async getAllContests(): Promise<Contest[]> {
    return await db.select().from(contests).orderBy(desc(contests.id));
  }

  async createContest(contest: InsertContest): Promise<Contest> {
    const [newContest] = await db
      .insert(contests)
      .values(contest)
      .returning();
    return newContest;
  }

  async updateContestParticipants(contestId: number, increment: number): Promise<void> {
    // Get current participant count
    const participantCount = await db
      .select({ count: db.count() })
      .from(participants)
      .where(eq(participants.contestId, contestId));
    
    await db
      .update(contests)
      .set({ totalParticipants: participantCount[0]?.count || 0 })
      .where(eq(contests.id, contestId));
  }

  async getQuestionsByContest(contestId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.contestId, contestId))
      .orderBy(questions.questionNumber);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db
      .insert(questions)
      .values(question)
      .returning();
    return newQuestion;
  }

  async updateQuestionAnswers(questionId: number, correctAnswer: string): Promise<void> {
    await db
      .update(questions)
      .set({ correctAnswer })
      .where(eq(questions.id, questionId));
  }

  async bulkUpdateAnswers(answers: {questionId: number, correctAnswer: string}[]): Promise<void> {
    for (const answer of answers) {
      await this.updateQuestionAnswers(answer.questionId, answer.correctAnswer);
    }
  }

  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const [newParticipant] = await db
      .insert(participants)
      .values(participant)
      .returning();
    return newParticipant;
  }

  async getParticipantBySession(sessionId: string): Promise<Participant | undefined> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.sessionId, sessionId));
    return participant || undefined;
  }

  async updateParticipantSelections(participantId: number, selections: any[], totalPoints?: number): Promise<void> {
    const updateData: any = {
      selections,
      submittedAt: new Date()
    };
    
    if (totalPoints !== undefined) {
      updateData.totalPoints = totalPoints;
    }

    await db
      .update(participants)
      .set(updateData)
      .where(eq(participants.id, participantId));
  }

  async getLeaderboard(contestId: number): Promise<LeaderboardEntry[]> {
    return await db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.contestId, contestId))
      .orderBy(leaderboard.rank);
  }

  async updateLeaderboard(contestId: number): Promise<void> {
    // Get all participants who have submitted selections
    const contestParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.contestId, contestId));

    const questionsData = await this.getQuestionsByContest(contestId);
    
    // Calculate scores for each participant
    for (const participant of contestParticipants) {
      if (!participant.selections) continue;
      
      let points = 0;
      let correctPredictions = 0;
      
      if (Array.isArray(participant.selections)) {
        for (const selection of participant.selections) {
          const question = questionsData.find(q => q.id === selection.questionId);
          if (question && question.correctAnswer === selection.selectedOption) {
            correctPredictions++;
            points += 100; // 100 points per correct answer
          }
        }
      }
      
      // Update participant points
      await db
        .update(participants)
        .set({ totalPoints: points })
        .where(eq(participants.id, participant.id));
    }

    // Get updated participants and sort by points
    const sortedParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.contestId, contestId))
      .orderBy(desc(participants.totalPoints));

    // Clear existing leaderboard entries for this contest
    await db
      .delete(leaderboard)
      .where(eq(leaderboard.contestId, contestId));

    // Insert new leaderboard entries
    for (let i = 0; i < sortedParticipants.length; i++) {
      const participant = sortedParticipants[i];
      const rank = i + 1;
      
      // Update participant rank
      await db
        .update(participants)
        .set({ rank })
        .where(eq(participants.id, participant.id));

      // Calculate correct predictions
      let correctPredictions = 0;
      if (Array.isArray(participant.selections)) {
        for (const selection of participant.selections) {
          const question = questionsData.find(q => q.id === selection.questionId);
          if (question && question.correctAnswer === selection.selectedOption) {
            correctPredictions++;
          }
        }
      }

      // Insert leaderboard entry
      await db
        .insert(leaderboard)
        .values({
          contestId,
          participantId: participant.id,
          rank,
          points: participant.totalPoints || 0,
          correctPredictions
        });
    }
  }

  async getParticipantRank(participantId: number): Promise<number> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId));
    return participant?.rank || 0;
  }
}

export const storage = new DatabaseStorage();
