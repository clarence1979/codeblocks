import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Sparkles, KeyRound, LogIn } from 'lucide-react';
import { aiAccess } from '../services/aiAccess';
import { AiStatusDot, useAiAccess } from './AiStatusDot';

interface AiInputPanelProps {
  onGenerateCode: (prompt: string) => void;
  isGenerating: boolean;
  inputText: string;
  onInputChange: (text: string) => void;
}

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as (new () => SpeechRecognitionLike) | null;
}

export function AiInputPanel({
  onGenerateCode,
  isGenerating,
  inputText,
  onInputChange
}: AiInputPanelProps) {
  const ai = useAiAccess();
  const ready = ai.mode === 'school' || ai.mode === 'own';
  const [isListening, setIsListening] = useState(false);
  const [notice, setNotice] = useState('');
  const [keyDraft, setKeyDraft] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [submittingKey, setSubmittingKey] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const textRef = useRef(inputText);
  const keyInputRef = useRef<HTMLInputElement>(null);
  textRef.current = inputText;
  const onInputChangeRef = useRef(onInputChange);
  onInputChangeRef.current = onInputChange;

  // One recogniser for the life of the panel; it adds what it hears to whatever is in the box.
  useEffect(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;
    const rec = new Recognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = navigator.language || 'en-US';
    rec.onresult = (event) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript + ' ';
      }
      if (finalText) {
        const current = textRef.current;
        onInputChangeRef.current((current && !current.endsWith(' ') ? current + ' ' : current) + finalText);
      }
    };
    rec.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setNotice('The browser is not allowed to use the microphone here. Allow the microphone for this page, or type instead.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setNotice(`Speech input stopped (${event.error}). You can type instead.`);
      }
    };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    return () => {
      rec.onend = null;
      try {
        rec.stop();
      } catch {
        /* not started */
      }
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(''), 6000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      setNotice('Speech input needs Chrome or Edge. In this browser, please type your idea.');
      return;
    }
    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      try {
        rec.start();
        setIsListening(true);
        setNotice('Listening… say what you want to build, then press Stop.');
      } catch {
        setIsListening(false);
      }
    }
  };

  const explainNotReady = () => {
    if (ai.mode === 'checking') {
      setNotice('Still checking for AI access. Try again in a moment.');
    } else {
      setNotice('AI is not set up yet. Enter an OpenAI key above, or sign in at teachingtools.dev.');
      keyInputRef.current?.focus();
    }
  };

  const handleSubmit = () => {
    if (isGenerating) {
      setNotice('The AI is already writing code. Please wait.');
      return;
    }
    if (!ready) {
      explainNotReady();
      return;
    }
    if (!inputText.trim()) {
      setNotice('Type or say what you want to build first.');
      return;
    }
    onGenerateCode(inputText.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const submitKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingKey) return;
    setKeyMessage('');
    setSubmittingKey(true);
    const result = await aiAccess.useOwnKey(keyDraft);
    setSubmittingKey(false);
    if (result.ok) {
      setKeyDraft('');
    } else {
      setKeyMessage(result.message);
    }
  };

  const checkingKey = submittingKey;
  const showKeyForm = (ai.mode === 'none' || submittingKey) && ai.mode !== 'school';
  const generateBlocked = !ready || isGenerating || !inputText.trim();

  return (
    <div className="flex flex-col border-r border-gray-700 h-full min-h-0">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-semibold text-gray-300">AI Input</h4>
          <span className="text-xs text-gray-500">(Optional)</span>
        </div>
        <AiStatusDot className="text-gray-300" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col p-3 gap-2">
        {showKeyForm && (
          <form onSubmit={submitKey} className="rounded-lg border border-gray-700 bg-gray-900/70 p-2.5 flex flex-col gap-2">
            <p className="text-xs text-gray-300">
              {ai.onTeachingTools && !ai.inDesktop
                ? 'Sign in at teachingtools.dev to use the school AI, or use your own OpenAI API key.'
                : ai.inDesktop
                  ? 'AI is not switched on for your teachingtools.dev account. You can use your own OpenAI API key instead.'
                  : 'To use AI, paste your OpenAI API key (kept in this browser only).'}
            </p>
            {ai.onTeachingTools && !ai.inDesktop && (
              <button
                type="button"
                onClick={() => aiAccess.openSignIn()}
                className="self-start flex items-center gap-1.5 px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign in at teachingtools.dev
              </button>
            )}
            <div className="flex gap-2">
              <label htmlFor="openai-key" className="sr-only">OpenAI API key</label>
              <input
                id="openai-key"
                ref={keyInputRef}
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={keyDraft}
                onChange={(e) => {
                  setKeyDraft(e.target.value);
                  setKeyMessage('');
                }}
                placeholder="OpenAI API key (starts with sk-)"
                className="flex-1 min-w-0 bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                aria-disabled={checkingKey}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-white ${checkingKey ? 'bg-gray-600 cursor-wait' : 'bg-green-600 hover:bg-green-500'}`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                {checkingKey ? 'Checking…' : 'Use key'}
              </button>
            </div>
            {(keyMessage || ai.ownKeyMessage) && (
              <p role="alert" className="text-xs text-amber-300">{keyMessage || ai.ownKeyMessage}</p>
            )}
          </form>
        )}

        {ai.mode === 'own' && (
          <p className="text-xs text-gray-400">
            Using your own OpenAI key (saved in this browser only).{' '}
            <button type="button" onClick={() => aiAccess.forgetOwnKey()} className="text-blue-400 hover:text-blue-300 underline">
              Forget my key
            </button>
          </p>
        )}

        {!showKeyForm && (
          <p className="text-xs text-gray-400">
            Describe what you want to create, and AI will write the Python code for you.
          </p>
        )}

        <label htmlFor="ai-prompt" className="sr-only">Describe what you want to build</label>
        <textarea
          id="ai-prompt"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what to build, e.g. a red pyramid 5 blocks high"
          className="flex-1 min-h-[3rem] bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          readOnly={isGenerating}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
              isListening ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            title="Speak your idea instead of typing"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Speak
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            aria-disabled={generateBlocked}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${
              generateBlocked ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Code
              </>
            )}
          </button>
        </div>

        {notice && (
          <p role="status" className="text-xs text-amber-300">{notice}</p>
        )}
      </div>
    </div>
  );
}
