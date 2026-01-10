import supabase from "@/supabase/component";

/**
 * Handles the user login process, including setting the session and fetching initial data.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {function} setIsLoading - State setter for loading status.
 * @param {function} setAlarms - Zustand store action to set alarms.
 */
export class LoginHandler {
  constructor(setIsLoading, setError, setAlarms) {
    this.setIsLoading = setIsLoading;
    this.setError = setError;
    this.setAlarms = setAlarms;
  }

  async #authenticateUser(email, password) {
    const authResponse = await fetch("/api/auth/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: email, password: password }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      throw new Error(authData.message || "Invalid login credentials.");
    }
    return authData;
  }

  async #setSupabaseSession(authData) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    });

    if (sessionError) throw sessionError;
  }

  async login(email, password) {
    this.setIsLoading(true);
    if (!email || !password) {
      this.setError("Please enter both email and password.");
      this.setIsLoading(false);
      return;
    }
    this.setError(""); // Reset error on new submission

    try {
      const authData = await this.#authenticateUser(email, password);
      await this.#setSupabaseSession(authData);

    } catch (error) {
      this.setError(error.message);
    } finally {
      this.setIsLoading(false);
    }
  }
}
