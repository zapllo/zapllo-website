// src/providers/fetchInstance.ts
export async function fetchInstance(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const isTrialExpired = localStorage.getItem("isTrialExpired") === "true";
    
    if (isTrialExpired) {
        // Cancel the fetch request by throwing an error
        throw new Error("Trial expired");
    }

    // Otherwise, proceed with the fetch request
    return fetch(input, init);
}
