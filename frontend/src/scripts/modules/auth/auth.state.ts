// src/auth/AuthState.ts
import { jwtDecode } from "jwt-decode";
import { JwtPayload as UserData } from "@darrenkuro/pong-core";
import { AuthFormData } from "./auth.types";

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
        window.log.info(`Token is: ${token}`);
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

    public async login(data: AuthFormData): Promise<number> {
        const username = data.username;
        const password = data.password;

        localStorage.setItem("username", username); // needed for TOTP, TODO: can be cleared after successful TOTP verification

        if (!username || !password) {
            window.log.info("Username and password are required");
            return 0;
        }
        try {
            const response = await fetch(`${window.cfg.url.user}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            if (!response.ok) {
                window.log.info(result.message || "Login failed");
                return 0;
            }

            if (result.data.totpEnabled) {
                window.log.info("Login credentials correct, but TOTP is required");
                return 2;
            } else {
                localStorage.setItem("token", result.data.token);
                this.loadUserFromToken();
                window.log.info("Login successful");
                return 1;
            }
        } catch (error) {
            window.log.info("Login error:", error);
            return 0;
        }
    }

    public async register(data: AuthFormData): Promise<boolean> {
        try {
            const response = await fetch(`${window.cfg.url.user}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                window.log.info(result.message || "Registration failed");
                return false;
            }

            localStorage.setItem("token", result.data.token);
            this.loadUserFromToken();
            window.log.info("Login successful");
            return true;
        } catch (error) {
            window.log.info("Registration error:", error);
            return false;
        }
    }

    public logout() {
        localStorage.removeItem("token");
        this.user = null;
    }
}

export const authState = AuthState.getInstance();
