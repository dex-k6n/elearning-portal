export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    isActive?: boolean;
    createdAt?: string;
}

export interface Skill {
    id: string;
    code: string;
    name: string;
    description: string | null;
}

export interface Question {
    id: string;
    skillId: string;
    prompt: string;
    options: string[];
    correctAnswer?: string;
    points: number;
    orderIndex: number;
}

export interface Assessment {
    id: string;
    title: string;
    description: string | null;
    type: 'PRACTICE' | 'TEST';
    dueDate?: string | null;
    questions?: Question[];
}

export interface SubmissionRecord {
    id: string;
    assessmentId: string;
    studentId: string;
    score: number;
    maxScore: number;
    submittedAt: string;
    answers?: Array<{
        questionId: string;
        selectedAnswer: string;
        isCorrect: boolean;
    }>;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const res = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data as T;
}

export const api = {
    login: (email: string, password: string) =>
        request<{ token: string; user: User }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
    me: () => request<{ user: User }>('/api/auth/me'),

    // Admin
    getUsers: () => request<{ users: User[] }>('/api/admin/users'),
    updateUserStatus: (id: string, isActive: boolean) =>
        request<{ user: User }>(`/api/admin/users/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }),
        }),

    // Assessments & Submissions
    getAssessments: () => request<{ assessments: Assessment[] }>('/api/assessments'),
    getAssessment: (id: string) => request<{ assessment: Assessment }>(`/api/assessments/${id}`),
    createAssessment: (payload: {
        title: string;
        description?: string;
        type: 'PRACTICE' | 'TEST';
        questions: Array<{
            skillId: string;
            prompt: string;
            options: string[];
            correctAnswer: string;
            points: number;
        }>;
    }) =>
        request<{ assessment: Assessment }>('/api/assessments', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
    getSubmissions: (assessmentId: string) =>
        request<{ submissions: SubmissionRecord[] }>(`/api/assessments/${assessmentId}/submissions`),
    submitAssessment: (id: string, answers: Array<{ questionId: string; selectedAnswer: string }>) =>
        request<{ submission: { id: string; score: number; maxScore: number } }>(
            `/api/assessments/${id}/submit`,
            {
                method: 'POST',
                body: JSON.stringify({ answers }),
            },
        ),
};