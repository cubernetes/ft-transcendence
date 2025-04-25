let jwtToken: string | null = null;

export function setToken(token: string) {
    jwtToken = token;
}

export function getToken(): string | null {
    return jwtToken;
}

export function clearToken() {
    jwtToken = null;
}
