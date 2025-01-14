'use server';

import { eq } from "drizzle-orm";
import { users } from "@/database/schema";
import { db } from "@/database/drizzle";
import bcrypt from "bcryptjs"; // Changed from crypto to bcryptjs
import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export const signInWithCredentials = async (params: Pick<AuthCredentials, "email" | "password">) => {
  const { email, password } = params;

  try {
    const result = await signIn('credentials', { 
      email, 
      password, 
      redirect: false ,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }
    
    return { success: true };  // Added missing return for success case
  } catch (error) {
    return { success: false, error: "Sign in failed" };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, universityID, password, universityCard } = params;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10); // Changed to bcrypt.hash

  try {
    await db.insert(users).values({  // Changed DataView to db
      fullName,
      email,
      universityID,
      password: hashedPassword,
      universityCard,
    });

    return { success: true };
  } catch (error) {
    console.log(error, 'Signup error');
    return { success: false, error: "Signup error" };
  }
};