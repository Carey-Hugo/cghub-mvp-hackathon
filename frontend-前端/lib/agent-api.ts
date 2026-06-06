const AGENT_API_URL = (
  process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:8787"
).replace(/\/$/, "");

export interface SignedContributionResponse {
  proof: Record<string, string>;
  signature: string;
}

export interface SubmitContributionResponse {
  txHash: string;
}

export interface PendingResponse {
  pending: string;
  score: string;
  claimed: string;
}

export interface TriggerClaimResponse {
  txId?: string;
  status?: string;
  skipped?: boolean;
  reason?: string;
}

export interface SignContributionRequest {
  contributor: string;
  score: number;
  source: string;
  evidenceId: string;
  paymentId?: string;
}

async function requestAgent<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${AGENT_API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof data?.error === "string" ? data.error : response.statusText;
    throw new Error(`Agent API ${response.status}: ${message}`);
  }

  return data as T;
}

export function signContribution(request: SignContributionRequest) {
  return requestAgent<SignedContributionResponse>("/api/sign-contribution", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function submitContribution(request: SignedContributionResponse) {
  return requestAgent<SubmitContributionResponse>("/api/submit-contribution", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getPending(contributor: string) {
  return requestAgent<PendingResponse>(
    `/api/pending?contributor=${encodeURIComponent(contributor)}`
  );
}

export function triggerClaim(contributor: string) {
  return requestAgent<TriggerClaimResponse>("/api/trigger-claim", {
    method: "POST",
    body: JSON.stringify({ contributor }),
  });
}
