import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users } from "../drizzle/schema";

// Full User from DB
export type User = InferSelectModel<typeof users>;

// Fix: Allow these fields to be optional manually
export type NewUser = Omit<InferInsertModel<typeof users>, "lastname" | "contactPhone" | "address"> & {
  lastname?: string;
  contactPhone?: string;
  address?: string;
};

// For updates
export type UpdateUserInput = Partial<NewUser>;
