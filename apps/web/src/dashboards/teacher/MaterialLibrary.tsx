import { useState } from 'react';
import {
    ArrowLeft,
    FileText,
    Image as ImageIcon,
    ListChecks,
    Plus,
    Trash2,
    Video,
} from 'lucide-react';
import { ExerciseCellEditor } from './exerciseCellEditor';
import {
    AVAILABLE_SKILLS,
    INITIAL_MATERIALS,
    TEACHER_CLASSES,
    createEmptyExerciseCell,
    type ContentCell,
    type StudyMaterial,
} from './types';

export function MaterialLibrarySection() {
    const [materials, setMaterials] = useState<StudyMaterial[]>(INITIAL_MATERIALS);
    const [creating, setCreating] = useState(false);

    const [title, setTitle] = useState('');
    const [targetSkills, setTargetSkills] = useState<string[]>(['ALG-01']);
    const [classAccess, setClassAccess] = useState<string[]>([TEACHER_CLASSES[0].name]);
    const [cells, setCells] = useState<ContentCell[]>([
        { id: 'init-txt', type: 'text', body: '' },
    ]);

    function toggleItem(list: string[], item: string, setter: (next: string[]) => void) {
        setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
    }

    function addCell(type: ContentCell['type']) {
        const id = `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        if (type === 'text') setCells((prev) => [...prev, { id, type: 'text', body: '' }]);
        if (type === 'image')
            setCells((prev) => [...prev, { id, type: 'image', url: '', caption: '' }]);
        if (type === 'video')
            setCells((prev) => [...prev, { id, type: 'video', url: '', caption: '' }]);
        if (type === 'exercise') setCells((prev) => [...prev, createEmptyExerciseCell()]);
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        setMaterials((prev) => [
            {
                id: `mat-${Date.now()}`,
                title: title.trim(),
                targetSkills,
                classAccess,
                cells,
                updatedAt: 'Just now',
            },
            ...prev,
        ]);
        setTitle('');
        setCells([{ id: 'init-txt', type: 'text', body: '' }]);
        setCreating(false);
    }

    if (!creating) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold">Material Library</h2>
                        <p className="text-xs text-zinc-400">
                            Interactive lessons combining text, media, and practice exercises.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setCreating(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 text-zinc-950 hover:bg-white rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add New Material
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materials.map((mat) => (
                        <div
                            key={mat.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-sm font-semibold text-zinc-100">{mat.title}</h3>
                                <span className="text-[11px] text-zinc-500 shrink-0">{mat.updatedAt}</span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {mat.targetSkills.map((code) => (
                                    <span
                                        key={code}
                                        className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300"
                                    >
                    {code}
                  </span>
                                ))}
                            </div>

                            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <span>
                  {mat.classAccess.length} {mat.classAccess.length === 1 ? 'class' : 'classes'} with
                  access
                </span>
                                <span>{mat.cells.length} content cells</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Material Library
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-100 text-zinc-950 hover:bg-white rounded-lg text-xs font-medium cursor-pointer"
                >
                    Save Material
                </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Material Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Chapter 5: Factoring Quadratic Trinomials"
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                            Target Skill(s)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SKILLS.map((sk) => {
                                const active = targetSkills.includes(sk.code);
                                return (
                                    <button
                                        key={sk.code}
                                        type="button"
                                        onClick={() => toggleItem(targetSkills, sk.code, setTargetSkills)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs border transition cursor-pointer ${
                                            active
                                                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-medium'
                                                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                    >
                                        {sk.code} · {sk.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                            Classes with Access
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TEACHER_CLASSES.map((cls) => {
                                const active = classAccess.includes(cls.name);
                                return (
                                    <button
                                        key={cls.id}
                                        type="button"
                                        onClick={() => toggleItem(classAccess, cls.name, setClassAccess)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs border transition cursor-pointer ${
                                            active
                                                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-medium'
                                                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                    >
                                        {cls.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Content Cells ({cells.length})</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => addCell('text')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 cursor-pointer"
                        >
                            <FileText className="w-3.5 h-3.5" /> + Text
                        </button>
                        <button
                            type="button"
                            onClick={() => addCell('image')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 cursor-pointer"
                        >
                            <ImageIcon className="w-3.5 h-3.5" /> + Image
                        </button>
                        <button
                            type="button"
                            onClick={() => addCell('video')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 cursor-pointer"
                        >
                            <Video className="w-3.5 h-3.5" /> + Video
                        </button>
                        <button
                            type="button"
                            onClick={() => addCell('exercise')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 cursor-pointer"
                        >
                            <ListChecks className="w-3.5 h-3.5" /> + Exercise
                        </button>
                    </div>
                </div>

                {cells.map((cell, index) => (
                    <div key={cell.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Cell {index + 1} · {cell.type}
              </span>
                            <button
                                type="button"
                                onClick={() => setCells((prev) => prev.filter((c) => c.id !== cell.id))}
                                className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {cell.type === 'text' && (
                            <textarea
                                rows={3}
                                value={cell.body}
                                onChange={(e) =>
                                    setCells((prev) =>
                                        prev.map((c) =>
                                            c.id === cell.id && c.type === 'text' ? { ...c, body: e.target.value } : c,
                                        ),
                                    )
                                }
                                placeholder="Write explanation, theorem statement, or worked example..."
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                            />
                        )}

                        {(cell.type === 'image' || cell.type === 'video') && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    value={cell.url}
                                    onChange={(e) =>
                                        setCells((prev) =>
                                            prev.map((c) =>
                                                c.id === cell.id && (c.type === 'image' || c.type === 'video')
                                                    ? { ...c, url: e.target.value }
                                                    : c,
                                            ),
                                        )
                                    }
                                    placeholder={cell.type === 'image' ? 'Image URL...' : 'Video URL...'}
                                    className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                                />
                                <input
                                    value={cell.caption}
                                    onChange={(e) =>
                                        setCells((prev) =>
                                            prev.map((c) =>
                                                c.id === cell.id && (c.type === 'image' || c.type === 'video')
                                                    ? { ...c, caption: e.target.value }
                                                    : c,
                                            ),
                                        )
                                    }
                                    placeholder="Caption or description..."
                                    className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                                />
                            </div>
                        )}

                        {cell.type === 'exercise' && (
                            <ExerciseCellEditor
                                cell={cell}
                                onChange={(updated) =>
                                    setCells((prev) => prev.map((c) => (c.id === cell.id ? updated : c)))
                                }
                            />
                        )}
                    </div>
                ))}
            </div>
        </form>
    );
}