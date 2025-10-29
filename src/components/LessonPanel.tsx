import { Book, ChevronRight, Copy, Check } from 'lucide-react';
import { LESSONS } from '../data/lessons';
import { Lesson } from '../types';
import { useState } from 'react';

interface LessonPanelProps {
  currentLessonId: number;
  onSelectLesson: (lesson: Lesson) => void;
}

export function LessonPanel({ currentLessonId, onSelectLesson }: LessonPanelProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const volumes = [
    { id: 1, title: 'Introduction', lessons: LESSONS.filter(l => l.volume === 1) },
    { id: 2, title: 'Python Basics', lessons: LESSONS.filter(l => l.volume === 2) },
    { id: 3, title: 'Building Structures', lessons: LESSONS.filter(l => l.volume === 3) }
  ];

  const currentLesson = LESSONS.find(l => l.id === currentLessonId);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatInstructions = (text: string) => {
    let codeBlockIndex = 0;

    // Replace code blocks with styled divs and add copy buttons
    const formatted = text.replace(
      /```(?:python)?\n([\s\S]*?)```/g,
      (_, code) => {
        const escapedCode = code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const blockId = `code-block-${codeBlockIndex++}`;
        return `<div class="relative group my-3">
          <pre class="bg-gray-950 border border-gray-700 rounded-lg p-4 overflow-x-auto"><code class="text-gray-300 text-sm font-mono whitespace-pre" style="user-select: text; cursor: text;">${escapedCode}</code></pre>
          <button
            data-code="${code.replace(/"/g, '&quot;')}"
            data-block-id="${blockId}"
            class="copy-code-btn absolute top-2 right-2 p-1 bg-gray-800/80 hover:bg-gray-700 rounded transition-all opacity-0 group-hover:opacity-100"
            title="Copy code"
          >
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>`;
      }
    );

    // Replace inline code
    return formatted
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-400">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 rounded text-green-400">$1</code>');
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
        <Book className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-bold text-white">Lessons</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentLesson && (
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <h3 className="text-xl font-bold text-white mb-2">
              {currentLesson.id}. {currentLesson.title}
            </h3>
            <p className="text-sm text-gray-400 mb-3">{currentLesson.description}</p>
            <div className="prose prose-invert prose-sm max-w-none">
              <div
                className="text-gray-300 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: formatInstructions(currentLesson.instructions)
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('.copy-code-btn')) {
                    const btn = target.closest('.copy-code-btn') as HTMLButtonElement;
                    const code = btn.getAttribute('data-code')?.replace(/&quot;/g, '"') || '';
                    handleCopyCode(code);
                  }
                }}
              />
            </div>
          </div>
        )}

        <div className="p-4">
          {volumes.map((volume) => (
            <div key={volume.id} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Volume {volume.id}: {volume.title}
              </h3>
              <div className="space-y-1">
                {volume.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between group ${
                      lesson.id === currentLessonId
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-sm">
                      {lesson.id}. {lesson.title}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        lesson.id === currentLessonId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
