import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const cardStatus = pgEnum("card_status", [
  "todo",
  "in_progress",
  "done",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const boards = pgTable("boards", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const lists = pgTable("lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  position: integer("position").notNull(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  position: integer("position").notNull(),
  listId: uuid("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  assigneeId: uuid("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  dueDate: timestamp("due_date"),
  status: cardStatus("status").default("todo").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  boards: many(boards),
  assignedCards: many(cards),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  owner: one(users, {
    fields: [boards.userId],
    references: [users.id],
  }),
  lists: many(lists),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  board: one(boards, {
    fields: [lists.boardId],
    references: [boards.id],
  }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  list: one(lists, {
    fields: [cards.listId],
    references: [lists.id],
  }),
  assignee: one(users, {
    fields: [cards.assigneeId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
export type List = typeof lists.$inferSelect;
export type NewList = typeof lists.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type CardStatus = (typeof cardStatus.enumValues)[number];
