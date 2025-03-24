export interface JwtPayload {
    id: string;
    username: string;
    displayName: string;
    iat?: number; // Optional, signed automatically by the JWT library
    exp?: number; // Optional, signed automatically by the JWT library
}
