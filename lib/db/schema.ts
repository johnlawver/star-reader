import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const gateTypeEnum = pgEnum("gate_type", ["pin", "math"]);
export const starRuleTypeEnum = pgEnum("star_rule_type", ["flat", "per_level"]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  gateType: gateTypeEnum("gate_type").notNull().default("pin"),
  pinHash: text("pin_hash"),
  starRuleType: starRuleTypeEnum("star_rule_type").notNull().default("flat"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
