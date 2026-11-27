import { useState } from 'react';
import { TEACHER_CLASSES } from './types';

export function StudentClassesSection() {
    const [selectedClassId, setSelectedClassId] = useState(TEACHER_CLASSES[0].id);
    const currentClass =
        TEACHER_CLASSES.find((c) => c.id === selectedClassId) ?? TEACHER_CLASSES[0];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold">Student Skill Reports</h2>
                    <p className="text-xs text-zinc-400">
                        Select a class to inspect individual mastery across curriculum skills.
                    </p>
                </div>

                <div className="flex gap-2">
                    {TEACHER_CLASSES.map((cls) => (
                        <button
                            key={cls.id}
                            type="button"
                            onClick={() => setSelectedClassId(cls.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                                selectedClassId === cls.id
                                    ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            {cls.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {currentClass.students.map((st) => (
                    <div
                        key={st.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-zinc-100">{st.name}</div>
                                <div className="text-xs text-zinc-400">{st.email}</div>
                            </div>
                            <span className="text-xs text-zinc-400">
                Avg Mastery:{' '}
                                <span className="font-semibold text-zinc-200">
                  {Math.round(
                      st.skills.reduce((acc, s) => acc + s.mastery, 0) / st.skills.length,
                  )}
                                    %
                </span>
              </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {st.skills.map((sk) => (
                                <div
                                    key={sk.code}
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-1.5"
                                >
                                    <div className="flex justify-between text-xs">
                                        <span className="font-mono text-zinc-400">{sk.code}</span>
                                        <span className="font-semibold tabular-nums text-zinc-200">{sk.mastery}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                                sk.mastery >= 80
                                                    ? 'bg-emerald-500'
                                                    : sk.mastery >= 50
                                                        ? 'bg-amber-400'
                                                        : 'bg-rose-500'
                                            }`}
                                            style={{ width: `${sk.mastery}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}