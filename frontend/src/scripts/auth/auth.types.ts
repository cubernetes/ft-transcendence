/// This is the data that is stored in the JWT token to identify the user, after successful login
export interface UserData {
    id: string;
    username: string;
    displayName?: string;
    exp: number;
}

/// This is the data that is sent to the backend when logging in or registering
export type AuthFormData = {
    username: string;
    password: string;
    displayName?: string;
    confirmPassword?: string;
};
