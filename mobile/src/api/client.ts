import { API_BASE_URL } from "../config";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  token?: string;
  body?: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: "Bearer";
  studentId: number;
  branchId: number;
};

export type ClassSession = {
  id: number;
  title: string;
  class_category: string | null;
  starts_at: string;
  ends_at: string;
  capacity: number;
  branch_name: string;
  belt_name: string;
  instructor_name: string;
};

export type DashboardResponse = {
  studentId: number;
  branchId: number;
  nextClass: {
    id: number;
    title: string;
    class_category: string | null;
    starts_at: string;
    ends_at: string;
    branch_name: string;
    belt_name: string;
    instructor_name: string;
  } | null;
  progress: {
    currentBelt: string;
    nextBelt: string | null;
    completedClasses: number;
    requiredClasses: number;
    progressPercentage: number;
  };
  goals: {
    activeCount: number;
    completedCount: number;
    topActive: Array<{
      id: number;
      title: string;
      current_value: number;
      target_value: number;
      unit: string;
      status: string;
      target_date: string | null;
    }>;
  };
  feedback: {
    averageRating: number | null;
    recent: Array<{
      id: number;
      rating: number;
      feedback_text: string;
      created_at: string;
      class_session_id: number;
      instructor_name: string;
    }>;
  };
};

export type ProgressResponse = {
  studentId: number;
  profileCode: string;
  currentBelt: string;
  nextBelt: string | null;
  completedClasses: number;
  requiredClasses: number;
  remainingClasses: number;
  progressPercentage: number;
  ibjjf: {
    currentBeltId: number;
    nextBeltId: number | null;
    sourceDocumentVersion: string | null;
    sourceDocumentPath: string | null;
    minTimeCurrentBeltMonths: number | null;
    monthsAtCurrentBelt: number;
    timeRequirementMet: boolean | null;
    minAgeYears: number | null;
    requiresInstructorApproval: boolean | null;
  };
};

export type CheckinResponse = {
  id: string;
  class_session_id: string;
  student_id: string;
  status: string;
  checked_in_at: string;
  checkinMethod?: "qr";
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const method = options.method ?? "GET";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body
  });

  if (!response.ok) {
    const rawText = await response.text();
    throw new Error(rawText || `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

