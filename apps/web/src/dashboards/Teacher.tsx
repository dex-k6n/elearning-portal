import { useState } from 'react';
import { BookOpen, CheckSquare, Users } from 'lucide-react';
import { AssessmentLibrarySection } from './teacher/AssessmentLibrary';
import { MaterialLibrarySection } from './teacher/MaterialLibrary';
import { StudentClassesSection } from './teacher/studentClassSelection';

type TeacherSection = 'classes' | 'materials' | 'assessments';

export function TeacherDashboard() {
    const [section, setSection] = useState<TeacherSection>('classes');

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
                <button
                    type="button"
                    onClick={() => setSection('classes')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        section === 'classes'
                            ? 'bg-zinc-100 text-zinc-950'
                            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 border border-zinc-800'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    Student Classes
                </button>

                <button
                    type="button"
                    onClick={() => setSection('materials')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        section === 'materials'
                            ? 'bg-zinc-100 text-zinc-950'
                            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 border border-zinc-800'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    Material Library
                </button>

                <button
                    type="button"
                    onClick={() => setSection('assessments')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        section === 'assessments'
                            ? 'bg-zinc-100 text-zinc-950'
                            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 border border-zinc-800'
                    }`}
                >
                    <CheckSquare className="w-4 h-4" />
                    Assessment Library
                </button>
            </div>

            {section === 'classes' && <StudentClassesSection />}
            {section === 'materials' && <MaterialLibrarySection />}
            {section === 'assessments' && <AssessmentLibrarySection />}
        </div>
    );
}