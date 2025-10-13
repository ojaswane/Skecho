"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {createServerSupabaseClient as createClient} from '@/lib/supabaseserver'

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return redirect("/error");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    return redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");
  const firstName = formData.get("first-name");
  const lastName = formData.get("last-name");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string"
  ) {
    return redirect("/error");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        email,
      },
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    return redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Signout error:", error.message);
    return redirect("/error");
  }

  redirect("/logout");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Google OAuth error:", error.message);
    return redirect("/error");
  }

  // data.url is required for Google redirect
  if (data?.url) {
    return redirect(data.url); // External redirect to Google's consent screen
  }

  return redirect("/error");
}