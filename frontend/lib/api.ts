/**
 * API client library for communicating with FastAPI Backend.
 */

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  models_configured: {
    text: string;
    vision: string;
    embedding: string;
  };
}

export interface ChatMessagePayload {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequestPayload {
  message: string;
  history?: ChatMessagePayload[];
  temperature?: number;
}

export interface ChatResponsePayload {
  response: string;
  model: string;
  timestamp: string;
  status: string;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "" : "http://localhost:8000");

/**
 * Fetch backend health status.
 */
export async function getHealthStatus(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }

  return response.json();
}

/**
 * Send chat message to FastAPI backend for local LLM inference.
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessagePayload[] = [],
  temperature: number = 0.7
): Promise<ChatResponsePayload> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      history,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const detail = errorData?.detail || `Chat request failed with status: ${response.status}`;
    throw new Error(detail);
  }

  return response.json();
}
