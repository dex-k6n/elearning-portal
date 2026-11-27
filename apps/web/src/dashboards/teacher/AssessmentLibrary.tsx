import { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, Plus, Trash2 } from 'lucide-react';
import { api, type Assessment, type SubmissionRecord } from '../../lib/api';
import { ExerciseCellEditor } from './exerciseCellEditor';
import { TEACHER_CLASSES, createEmptyExerciseCell, type ExerciseCell } from './types';

type AssessmentWithClass = Assessment & { assignedClass?: string };

export function AssessmentLibrarySection() {
    const [assessments, setAssessments] = useState<AssessmentWithClass[]>([]);
    const [creating, setCreating] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'TEST' | 'PRACTICE'>('TEST');
    const [assignedClass, setAssignedClass] = useState<string>(TEACHER_CLASSES[0].name);
    const [cells, setCells] = useState<ExerciseCell[]>([createEmptyExerciseCell()]);

    const [scoresTarget, setScoresTarget] = useState<AssessmentWithClass | null>(null);
    const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);

    useEffect(() => {
        api
            .getAssessments()
            .then((res) =>
                setAssessments(
                    res.assessments.map((a) => ({
                        ...a,
                        assignedClass: TEACHER_CLASSES[0].name,
                    })),
                ),
            )
            .catch(() => {});
    }, []);

    async function openScores(assessment: AssessmentWithClass) {
        setScoresTarget(assessment);
        try {
            const res = await api.getSubmissions(assessment.id);
            setSubmissions(res.submissions);
        } catch {
            setSubmissions([]);
        }
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        setAssessments((prev) => [
            {
                id: `local-${Date.now()}`,
                title: title.trim(),
                description: description.trim() || null,
                type,
                assignedClass: assignedClass || undefined,
                questions: cells.map((c, idx) => ({
                    id: c.id,
                    skillId: c.skillCode,
                    prompt: c.prompt || `Exercise ${idx + 1}`,
                    options: c.options,
                    points: c.points,
                    orderIndex: idx,
                })),
            },
            ...prev,
        ]);
        setTitle('');
        setDescription('');
        setCells([createEmptyExerciseCell()]);
        setCreating(false);
    }

    if (scoresTarget) {
        return (
            <div className="space-y-4">
                <button
                    type="button"
                    onClick={() => setScoresTarget(null)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Assessment Library
                </button>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                    <div>
                        <h2 className="text-base font-semibold">{scoresTarget.title} — Scores</h2>
                        <p className="text-xs text-zinc-400">Assigned to {scoresTarget.assignedClass}</p>
                    </div>

                    {submissions.length === 0 ? (
                        <p className="text-xs text-zinc-400 py-4">
                            No student submissions recorded for this assessment yet.
                        </p>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {submissions.map((sub) => (
                                <div key={sub.id} className="py-3 flex items-center justify-between text-xs">
                                    <div>
                                        <span className="font-mono text-zinc-300">Student: {sub.studentId}</span>
                                        <div className="text-zinc-500 mt-0.5">
                                            Submitted {new Date(sub.submittedAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                    <span className="text-sm font-semibold text-zinc-100">
                      {sub.score} / {sub.maxScore} pts
                    </span>
                                        <div className="text-zinc-400">
                                            {Math.round((sub.score / sub.maxScore) * 100)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (creating) {
        return (
            <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setCreating(false)}
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Assessment Library
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-zinc-100 text-zinc-950 hover:bg-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                        Publish Assessment
                    </button>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                Assessment Title
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Quadratic Functions Checkpoint"
                                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as 'TEST' | 'PRACTICE')}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm"
                            >
                                <option value="TEST">Graded Test</option>
                                <option value="PRACTICE">Practice Quiz</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional instructions..."
                                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                Assign to Class
                            </label>
                            <select
                                value={assignedClass}
                                onChange={(e) => setAssignedClass(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                            >
                                <option value="">Save as unassigned draft</option>
                                {TEACHER_CLASSES.map((cls) => (
                                    <option key={cls.id} value={cls.name}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Exercise Cells ({cells.length})</h3>
                        <button
                            type="button"
                            onClick={() => setCells((prev) => [...prev, createEmptyExerciseCell()])}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-200 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Exercise Cell
                        </button>
                    </div>

                    {cells.map((cell, index) => (
                        <div
                            key={cell.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Exercise {index + 1} · Multiple Answer
                </span>
                                {cells.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setCells((prev) => prev.filter((c) => c.id !== cell.id))}
                                        className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <ExerciseCellEditor
                                cell={cell}
                                onChange={(updated) =>
                                    setCells((prev) => prev.map((c) => (c.id === cell.id ? updated : c)))
                                }
                            />
                        </div>
                    ))}
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold">Assessment Library</h2>
                    <p className="text-xs text-zinc-400">
                        Create graded tests or practice evaluations and inspect student scores.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 text-zinc-950 hover:bg-white rounded-lg text-xs font-medium transition cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessments.map((a) => (
                    <div
                        key={a.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between gap-4"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-zinc-100">{a.title}</h3>
                                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {a.type}
                </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                                {a.description || 'No description provided'}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                {a.assignedClass ? `Assigned: ${a.assignedClass}` : 'Unassigned draft'}
              </span>
                            {a.assignedClass && (
                                <button
                                    type="button"
                                    onClick={() => openScores(a)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-200 cursor-pointer"
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    View Scores
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}