export const AVAILABLE_SKILLS = [
    { code: 'ALG-01', name: 'Linear Equations' },
    { code: 'ALG-02', name: 'Quadratic Functions' },
    { code: 'CALC-01', name: 'Limits & Continuity' },
];

export const TEACHER_CLASSES = [
    {
        id: 'cls-10a',
        name: 'Class 10A — Algebra & Functions',
        students: [
            {
                id: 'st-1',
                name: 'Andrei Ionescu',
                email: 'student@portal.edu',
                skills: [
                    { code: 'ALG-01', mastery: 67 },
                    { code: 'ALG-02', mastery: 85 },
                    { code: 'CALC-01', mastery: 30 },
                ],
            },
            {
                id: 'st-2',
                name: 'Maria Dumitrescu',
                email: 'maria.d@portal.edu',
                skills: [
                    { code: 'ALG-01', mastery: 92 },
                    { code: 'ALG-02', mastery: 78 },
                    { code: 'CALC-01', mastery: 64 },
                ],
            },
        ],
    },
    {
        id: 'cls-11b',
        name: 'Class 11B — Pre-Calculus',
        students: [
            {
                id: 'st-3',
                name: 'Vlad Popa',
                email: 'vlad.p@portal.edu',
                skills: [
                    { code: 'ALG-01', mastery: 88 },
                    { code: 'ALG-02', mastery: 71 },
                    { code: 'CALC-01', mastery: 54 },
                ],
            },
        ],
    },
];

export type ExerciseCell = {
    id: string;
    type: 'exercise';
    skillCode: string;
    prompt: string;
    options: string[];
    correctIndices: number[];
    points: number;
};

export type ContentCell =
    | { id: string; type: 'text'; body: string }
    | { id: string; type: 'image'; url: string; caption: string }
    | { id: string; type: 'video'; url: string; caption: string }
    | ExerciseCell;

export interface StudyMaterial {
    id: string;
    title: string;
    targetSkills: string[];
    classAccess: string[];
    cells: ContentCell[];
    updatedAt: string;
}

export const INITIAL_MATERIALS: StudyMaterial[] = [
    {
        id: 'mat-1',
        title: 'Chapter 2: Solving Multi-Step Linear Equations',
        targetSkills: ['ALG-01'],
        classAccess: ['Class 10A — Algebra & Functions'],
        cells: [
            {
                id: 'c-1',
                type: 'text',
                body: 'Isolate the variable term on one side before dividing by the coefficient.',
            },
            {
                id: 'c-2',
                type: 'exercise',
                skillCode: 'ALG-01',
                prompt: 'Which values satisfy 2x + 6 = 14?',
                options: ['x = 3', 'x = 4', 'x = 8/2', 'x = 10'],
                correctIndices: [1, 2],
                points: 2,
            },
        ],
        updatedAt: 'Nov 25, 2026',
    },
    {
        id: 'mat-2',
        title: 'Chapter 4: Algebraic Limits & Continuity',
        targetSkills: ['CALC-01', 'ALG-02'],
        classAccess: ['Class 10A — Algebra & Functions', 'Class 11B — Pre-Calculus'],
        cells: [
            {
                id: 'c-3',
                type: 'video',
                url: 'https://example.edu/lectures/limits-intro',
                caption: 'Visual intuition behind left-hand and right-hand limits',
            },
        ],
        updatedAt: 'Nov 26, 2026',
    },
];

export function createEmptyExerciseCell(): ExerciseCell {
    return {
        id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'exercise',
        skillCode: 'ALG-01',
        prompt: '',
        options: ['', '', '', ''],
        correctIndices: [0],
        points: 2,
    };
}