// config/api.ts
export const API_BASE =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:5080";


export async function apiFetch(path: string, options?: RequestInit) {
    const url = `${API_BASE}${path}`;
    console.log("🔎 Fetching:", url, options);  // 👈 debug log
    const res = await fetch(url, options);
    return res;
}