CREATE TYPE "public"."gate_type" AS ENUM('pin', 'math');--> statement-breakpoint
CREATE TYPE "public"."star_rule_type" AS ENUM('flat', 'per_level');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"gate_type" "gate_type" DEFAULT 'pin' NOT NULL,
	"pin_hash" text,
	"star_rule_type" "star_rule_type" DEFAULT 'flat' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
