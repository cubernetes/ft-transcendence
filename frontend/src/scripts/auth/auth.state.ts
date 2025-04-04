// src/auth/AuthState.ts
import { jwtDecode } from "jwt-decode";
import { USER_URL } from "../config";
import { logger } from "../utils/logger";
import { AuthFormData, UserData } from "./auth.types";

class AuthState {
    private static instance: AuthState;
    private user: UserData | null = null;

    private constructor() {
        this.loadUserFromToken();
    }

    public static getInstance(): AuthState {
        if (!AuthState.instance) {
            AuthState.instance = new AuthState();
        }
        return AuthState.instance;
    }

    private loadUserFromToken(): UserData | null {
        const token = localStorage.getItem("token");
        logger.info(`Token is: ${token}`);
        if (token) {
            try {
                const decoded: UserData = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    this.user = decoded;
                } else {
                    this.logout();
                }
            } catch {
                this.logout();
            }
        }
        return this.user;
    }

    public getUser(): UserData | null {
        return this.user;
    }

    public async login(data: AuthFormData): Promise<boolean> {
        const username = data.username;
        const password = data.password;
        if (!username || !password) {
            logger.info("Username and password are required");
            return false;
        }
        try {
            const response = await fetch(`${USER_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            if (!response.ok) {
                logger.info(result.message || "Login failed");
                return false;
            }

            localStorage.setItem("token", result.data.token);
            this.loadUserFromToken();
            logger.info("Login successful");
            return true;
        } catch (error) {
            logger.info("Login error:", error);
            return false;
        }
    }

    public async register(data: AuthFormData): Promise<boolean> {
        try {
            const response = await fetch(`${USER_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                logger.info(result.message || "Registration failed");
                return false;
            }

            localStorage.setItem("token", result.data.token);
            this.loadUserFromToken();
            logger.info("Login successful");
            return true;
        } catch (error) {
            logger.info("Registration error:", error);
            return false;
        }
    }

    public logout() {
        localStorage.removeItem("token");
        this.user = null;
    }
}

export const authState = AuthState.getInstance();
