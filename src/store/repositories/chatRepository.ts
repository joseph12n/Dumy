import type { SQLiteDatabase } from "expo-sqlite";
import { nowISO } from "../../utils/dates";
import { generateId } from "../../utils/uuid";
import { ChatMessage, ChatRole, CreateChatMessageInput } from "../types";

type ChatMessageRow = {
  id: string;
  role: string;
  content: string;
  created_at: string;
  session_id: string;
};

function rowToChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role as ChatRole,
    content: row.content,
    createdAt: row.created_at,
    sessionId: row.session_id,
  };
}

export const chatRepository = {
  /**
   * Insert a new chat message
   */
  async insertMessage(
    db: SQLiteDatabase,
    input: CreateChatMessageInput,
  ): Promise<ChatMessage> {
    const id = generateId();
    const now = nowISO();

    await db.runAsync(
      `INSERT INTO chat_messages (id, role, content, created_at, session_id)
       VALUES (?, ?, ?, ?, ?)`,
      [id, input.role, input.content, now, input.sessionId],
    );

    return {
      id,
      role: input.role,
      content: input.content,
      createdAt: now,
      sessionId: input.sessionId,
    };
  },

  /**
   * Get all messages for a session, ordered by creation time (oldest first)
   */
  async getSession(
    db: SQLiteDatabase,
    sessionId: string,
  ): Promise<ChatMessage[]> {
    const rows = await db.getAllAsync<ChatMessageRow>(
      `SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC`,
      [sessionId],
    );
    return rows.map(rowToChatMessage);
  },

  /**
   * Get the most recent N messages from any session
   */
  async getRecentMessages(
    db: SQLiteDatabase,
    limit: number = 10,
  ): Promise<ChatMessage[]> {
    const rows = await db.getAllAsync<ChatMessageRow>(
      `SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT ? `,
      [limit],
    );
    // Reverse to get chronological order (oldest first)
    return rows.reverse().map(rowToChatMessage);
  },

  /**
   * Delete all messages for a session
   */
  async deleteSession(db: SQLiteDatabase, sessionId: string): Promise<void> {
    await db.runAsync("DELETE FROM chat_messages WHERE session_id = ?", [
      sessionId,
    ]);
  },

  /**
   * Get all unique session IDs, ordered by most recent activity
   */
  async getAllSessions(db: SQLiteDatabase): Promise<string[]> {
    const rows = await db.getAllAsync<{ session_id: string }>(
      `SELECT DISTINCT session_id FROM chat_messages ORDER BY MAX(created_at) DESC`,
    );
    return rows.map((r) => r.session_id);
  },

  /**
   * Delete all chat messages (for full history reset)
   */
  async clearAll(db: SQLiteDatabase): Promise<void> {
    await db.runAsync("DELETE FROM chat_messages");
  },

  /**
   * Get message count for a session
   */
  async getSessionMessageCount(
    db: SQLiteDatabase,
    sessionId: string,
  ): Promise<number> {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM chat_messages WHERE session_id = ?`,
      [sessionId],
    );
    return result?.count || 0;
  },
};
