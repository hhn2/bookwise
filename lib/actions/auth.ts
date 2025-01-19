'use server';

import { eq } from "drizzle-orm";
import { users } from "@/database/schema";
import { db } from "@/database/drizzle";
import bcrypt from "bcryptjs"; // Changed from crypto to bcryptjs
import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import ratelimit from "@/lib/ratelimit";
import { workflowClient } from "../workflow";
import config from "../config";




export const signInWithCredentials = async (params: Pick<AuthCredentials, "email" | "password">) => {
  const { email, password } = params;
  const ip=(await headers()).get('x-forwarded-for') || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if(!success) return redirect("/too-fast");
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
  const ip=(await headers()).get('x-forwarded-for') || "127.0.0.1";
  const {success} = await ratelimit.limit(ip);

  if(!success) return redirect("/too-fast");
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10); 

  try {
    await db.insert(users).values({  
      fullName,
      email,
      universityID,
      password: hashedPassword,
      universityCard,
    });

    try {
  const workflowResponse = await workflowClient.trigger({
    url: `${config.env.prodApiEndpoint}/api/workflows/onboarding`,
    body: { email, fullName },
  });

  console.log('Workflow Trigger Response:', workflowResponse);  // Log the full response

  // Inspect what the response contains, and adapt your code
  if (workflowResponse.workflowRunId) {
    console.log('Workflow Run ID:', workflowResponse.workflowRunId);
  } else {
    console.error('Unexpected workflow response:', workflowResponse);
    return { success: false, error: 'Unexpected workflow response format.' };
  }
} catch (error) {
  console.error('Error triggering workflow:', error);
  return { success: false, error: 'Error triggering onboarding workflow.' };
}


    await signInWithCredentials({email, password});
    return { success: true };
  } 
  catch (error) {
    console.log(error, 'Signup error');
    return { success: false, error: "Signup error" };
  }
};