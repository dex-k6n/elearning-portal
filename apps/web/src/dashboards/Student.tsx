import { useEffect, useState } from 'react';
import {
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileText,
    Lock,
    Play,
    Sparkles,
} from 'lucide-react';
import { api, type Assessment } from '../lib/api';

interface SkillProgress {
    code: string;
    name: string;
    mastery: number;
    statusLabel: string;
    attempts: number;
    lastPracticed: string;
    nextMilestone: string;
}

const STUDENT_SKILLS: SkillProgress[] = [
    {
        code: 'ALG-01',
        name: 'Linear Equations',
        mastery: 67,
        statusLabel: 'Developing',
        attempts: 6,
        lastPracticed: '2 days ago',
        nextMilestone: 'Multi-step equations with fractions (75% target)',
    },
    {
        code: 'ALG-02',
        name: 'Quadratic Functions',
        mastery: 85,
        statusLabel: 'Proficient',
        attempts: 11,
        lastPracticed: 'Today',
        nextMilestone: 'Completed — ready for Polynomials',
    },
    {
        code: 'CALC-01',
        name: 'Limits & Continuity',
        mastery: 30,
        statusLabel: 'Needs Practice',
        attempts: 2,
        lastPracticed: '5 days ago',
        nextMilestone: 'One-sided limits & algebraic substitution',
    },
];

const CHAPTERS_IN_PROGRESS = [
    {
        id: 'ch-1',
        skillCode: 'ALG-01',
        title: 'Chapter 2: Solving Multi-Step Linear Equations',
        materialType: 'Lecture Notes + Worked Examples',
        exercisesDone: 4,
        exercisesTotal: 6,
    },
    {
        id: 'ch-2',
        skillCode: 'CALC-01',
        title: 'Chapter 4: Introduction to Algebraic Limits',
        materialType: 'Interactive Guide + Practice Set',
        exercisesDone: 2,
        exercisesTotal: 8,
    },
];

const NEW_CHAPTERS = [
    {
        id: 'ch-3',
        title: 'Chapter 3: Polynomial Factorization & Roots',
        prerequisiteCode: 'ALG-02',
        requiredMastery: 75,
        summary: 'Synthetic division, remainder theorem, and higher-degree roots.',
    },
    {
        id: 'ch-4',
        title: 'Chapter 5: Derivatives from First Principles',
        prerequisiteCode: 'CALC-01',
        requiredMastery: 70,
        summary: 'Difference quotients, tangent slopes, and differentiability.',
    },
];

function getMasteryTheme(mastery: number) {
    if (mastery >= 80) {
        return {
            bar: 'bg-emerald-500',
            badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            percent: 'text-emerald-400',
        };
    }
    if (mastery >= 50) {
        return {
            bar: 'bg-amber-400',
            badge: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
            percent: 'text-amber-300',
        };
    }
    return {
        bar: 'bg-rose-500',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        percent: 'text-rose-400',
    };
}

export function StudentDashboard() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});
    const [activeQuiz, setActiveQuiz] = useState<Assessment | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [quizResult, setQuizResult] = useState<{ score: number; maxScore: number } | null>(null);

    useEffect(() => {
        api.getAssessments().then((res) => setAssessments(res.assessments)).catch(() => {});
    }, []);

    function toggleSkill(code: string) {
        setExpandedSkills((prev) => ({ ...prev, [code]: !prev[code] }));
    }

    async function startAssessment(id: string) {
        const res = await api.getAssessment(id);
        setActiveQuiz(res.assessment);
        setSelectedAnswers({});
        setQuizResult(null);
    }

    async function submitQuiz() {
        if (!activeQuiz?.questions) return;
        const payload = activeQuiz.questions.map((q) => ({
            questionId: q.id,
            selectedAnswer: selectedAnswers[q.id] || '',
        }));
        const res = await api.submitAssessment(activeQuiz.id, payload);
        setQuizResult({ score: res.submission.score, maxScore: res.submission.maxScore });
    }

    const skillMasteryMap = Object.fromEntries(STUDENT_SKILLS.map((s) => [s.code, s.mastery]));

    return (
        <div className="space-y-8">
            {/* 2a. Skill Overview */}
            <section className="space-y-3">
                <div className="flex items-baseline justify-between">
                    <h2 className="text-base font-semibold tracking-tight">Skill Overview</h2>
                    <span className="text-xs text-zinc-400">Updated from recent practice & tests</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {STUDENT_SKILLS.map((skill) => {
                        const theme = getMasteryTheme(skill.mastery);
                        const isExpanded = !!expandedSkills[skill.code];

                        return (
                            <div
                                key={skill.code}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="font-mono text-[11px] text-zinc-400">{skill.code}</span>
                                        <h3 className="text-sm font-semibold text-zinc-100 mt-0.5">{skill.name}</h3>
                                    </div>
                                    <span
                                        className={`text-[11px] px-2 py-0.5 rounded border font-medium ${theme.badge}`}
                                    >
                    {skill.statusLabel}
                  </span>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400">Mastery</span>
                                        <span className={`font-semibold tabular-nums ${theme.percent}`}>
                      {skill.mastery}%
                    </span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${theme.bar}`}
                                            style={{ width: `${skill.mastery}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="pt-1 border-t border-zinc-800/80">
                                    <button
                                        type="button"
                                        onClick={() => toggleSkill(skill.code)}
                                        className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                                    >
                                        <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
                                        {isExpanded ? (
                                            <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-2 text-xs text-zinc-300">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Questions answered</span>
                                                <span className="font-medium">{skill.attempts}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Last practiced</span>
                                                <span>{skill.lastPracticed}</span>
                                            </div>
                                            <div className="pt-1">
                                                <span className="text-zinc-500 block mb-0.5">Recommended focus</span>
                                                <p className="text-zinc-300 leading-relaxed">{skill.nextMilestone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Interactive Quiz Drawer when an Assessment is started */}
            {activeQuiz && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                        <div>
                            <h3 className="text-base font-semibold">{activeQuiz.title}</h3>
                            <p className="text-xs text-zinc-400">{activeQuiz.description}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveQuiz(null)}
                            className="text-xs text-zinc-400 hover:text-zinc-100 cursor-pointer"
                        >
                            Close
                        </button>
                    </div>

                    {quizResult ? (
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center space-y-2">
                            <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
                            <h4 className="text-base font-semibold">Submission Recorded</h4>
                            <p className="text-sm text-zinc-300">
                                Score: <span className="font-semibold text-emerald-400">{quizResult.score}</span> /{' '}
                                {quizResult.maxScore} points
                            </p>
                            <p className="text-xs text-zinc-500">
                                Your skill mastery scores are being recalculated.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activeQuiz.questions?.map((q, i) => (
                                <div key={q.id} className="space-y-3">
                                    <div className="text-sm font-medium">
                                        <span className="text-zinc-400 mr-2">{i + 1}.</span>
                                        {q.prompt} <span className="text-xs text-zinc-500">({q.points} pts)</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {(Array.isArray(q.options) ? q.options : []).map((opt) => {
                                            const selected = selectedAnswers[q.id] === opt;
                                            return (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }))
                                                    }
                                                    className={`text-left px-4 py-2.5 rounded-lg border text-sm transition cursor-pointer ${
                                                        selected
                                                            ? 'bg-zinc-800 border-zinc-500 text-white'
                                                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                                                    }`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={submitQuiz}
                                className="px-5 py-2 bg-zinc-100 text-zinc-950 hover:bg-white rounded-lg text-sm font-medium transition cursor-pointer"
                            >
                                Submit Answers
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 2b. Assigned Assessments */}
            <section className="space-y-3">
                <h2 className="text-base font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-zinc-400" />
                    Assigned Assessments
                </h2>
                {assessments.length === 0 ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-sm text-zinc-400">
                        No assessments currently assigned.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assessments.map((a) => (
                            <div
                                key={a.id}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between gap-4"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{a.title}</span>
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {a.type}
                    </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        {a.description || 'Complete before due date'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => startAssessment(a.id)}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 text-zinc-950 hover:bg-white rounded-lg text-xs font-medium transition shrink-0 cursor-pointer"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                    Start
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 2c & 2d. Chapters in Progress + New Chapters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2c. Chapters in Progress */}
                <section className="space-y-3">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-400" />
                        Chapters in Progress
                    </h2>
                    <div className="space-y-3">
                        {CHAPTERS_IN_PROGRESS.map((ch) => {
                            const pct = Math.round((ch.exercisesDone / ch.exercisesTotal) * 100);
                            return (
                                <div
                                    key={ch.id}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="font-mono text-[11px] text-zinc-400">{ch.skillCode}</span>
                                            <h3 className="text-sm font-medium text-zinc-100 mt-0.5">{ch.title}</h3>
                                            <p className="text-xs text-zinc-400 mt-0.5">{ch.materialType}</p>
                                        </div>
                                        <span className="text-xs text-zinc-300 font-medium tabular-nums">
                      {ch.exercisesDone}/{ch.exercisesTotal} exercises
                    </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-zinc-300 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className="text-xs text-zinc-300 hover:text-white underline underline-offset-4 cursor-pointer"
                                        >
                                            Continue study & exercises
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 2d. New Chapters (Gated by Prerequisite Skill Progress) */}
                <section className="space-y-3">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-zinc-400" />
                        New Chapters
                    </h2>
                    <div className="space-y-3">
                        {NEW_CHAPTERS.map((ch) => {
                            const currentMastery = skillMasteryMap[ch.prerequisiteCode] ?? 0;
                            const unlocked = currentMastery >= ch.requiredMastery;

                            return (
                                <div
                                    key={ch.id}
                                    className={`border rounded-xl p-5 space-y-2.5 ${
                                        unlocked
                                            ? 'bg-zinc-900 border-zinc-800'
                                            : 'bg-zinc-900/40 border-zinc-800/70 opacity-80'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-sm font-medium text-zinc-100">{ch.title}</h3>
                                        {unlocked ? (
                                            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium shrink-0">
                        Unlocked
                      </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-zinc-400">{ch.summary}</p>

                                    <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      Requires <span className="font-mono text-zinc-300">{ch.prerequisiteCode}</span>{' '}
                        ≥ {ch.requiredMastery}% (Current: {currentMastery}%)
                    </span>
                                        {unlocked && (
                                            <button
                                                type="button"
                                                className="px-3 py-1 bg-zinc-100 text-zinc-950 hover:bg-white rounded-md font-medium transition cursor-pointer"
                                            >
                                                Start Chapter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}