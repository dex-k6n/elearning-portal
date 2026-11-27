import { AVAILABLE_SKILLS, type ExerciseCell } from './types';

interface ExerciseCellEditorProps {
    cell: ExerciseCell;
    onChange: (updated: ExerciseCell) => void;
}

export function ExerciseCellEditor({ cell, onChange }: ExerciseCellEditorProps) {
    function toggleCorrectIndex(idx: number) {
        const exists = cell.correctIndices.includes(idx);
        const next = exists
            ? cell.correctIndices.filter((i) => i !== idx)
            : [...cell.correctIndices, idx];
        onChange({ ...cell, correctIndices: next });
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                    <label className="block text-[11px] text-zinc-400 mb-1">Question Prompt</label>
                    <input
                        value={cell.prompt}
                        onChange={(e) => onChange({ ...cell, prompt: e.target.value })}
                        placeholder="Enter question text..."
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                    />
                </div>

                <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Evaluated Skill</label>
                    <select
                        value={cell.skillCode}
                        onChange={(e) => onChange({ ...cell, skillCode: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                    >
                        {AVAILABLE_SKILLS.map((sk) => (
                            <option key={sk.code} value={sk.code}>
                                {sk.code}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Points</label>
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={cell.points}
                        onChange={(e) => onChange({ ...cell, points: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
        <span className="block text-[11px] text-zinc-400">
          Answer Choices (check all correct answers)
        </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cell.options.map((opt, idx) => {
                        const isCorrect = cell.correctIndices.includes(idx);
                        return (
                            <div
                                key={idx}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                                    isCorrect
                                        ? 'bg-emerald-950/25 border-emerald-500/40'
                                        : 'bg-zinc-950 border-zinc-800'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isCorrect}
                                    onChange={() => toggleCorrectIndex(idx)}
                                    className="accent-emerald-500 cursor-pointer"
                                />
                                <input
                                    value={opt}
                                    onChange={(e) => {
                                        const nextOpts = [...cell.options];
                                        nextOpts[idx] = e.target.value;
                                        onChange({ ...cell, options: nextOpts });
                                    }}
                                    placeholder={`Option ${idx + 1}`}
                                    className="w-full bg-transparent text-xs focus:outline-none"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}