import { useState, useEffect } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { ConsoleOutput } from './components/ConsoleOutput';
import { Scene3D } from './components/Scene3D';
import { LessonPanel } from './components/LessonPanel';
import { MaterialsPalette } from './components/MaterialsPalette';
import { WelcomeModal } from './components/WelcomeModal';
import { PrivacyModal } from './components/PrivacyModal';
import { TermsModal } from './components/TermsModal';
import { QuickExamples } from './components/QuickExamples';
import { LoginModal } from './components/LoginModal';
import { ResizeHandle } from './components/ResizeHandle';
import { useCodeCraftStore } from './store/useCodeCraftStore';
import { executePythonCode } from './utils/pythonExecutor';
import { generateCodeFromPrompt } from './services/openai';
import { attemptAutoLogin, loginWithCredentials, getStoredUser, logout, isInIframe, AuthUser } from './services/auth';
import { LESSONS } from './data/lessons';
import { Lesson } from './types';
import { Boxes, Maximize2, Minimize2, ChevronLeft, ChevronRight, Wrench, Settings, BookOpen, Code, Box, Menu, X, ChevronUp, ChevronDown, LogOut, Loader } from 'lucide-react';

function App() {
  const {
    blocks,
    consoleOutput,
    isRunning,
    currentLesson,
    showWelcomeModal,
    blockCount,
    isFullscreen3D,
    addBlock,
    clearBlocks,
    addConsoleOutput,
    clearConsole,
    setIsRunning,
    setCurrentLesson,
    setShowWelcomeModal,
    setIsFullscreen3D,
    isPositionOccupied
  } = useCodeCraftStore();

  const [code, setCode] = useState('');
  const [showLessons, setShowLessons] = useState(true);
  const [showCodeEditor, setShowCodeEditor] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [aiInputText, setAiInputText] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'lessons' | 'code' | '3d'>('3d');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [lessonsPanelWidth, setLessonsPanelWidth] = useState(320);
  const [codeEditorWidth, setCodeEditorWidth] = useState(60);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [isFooterCollapsed, setIsFooterCollapsed] = useState(false);
  const [autoOffsetEnabled, setAutoOffsetEnabled] = useState(true);

  useEffect(() => {
    // Detect mobile/tablet
    const checkMobile = () => {
      const width = window.innerWidth;
      const isMobileDevice = width < 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);

      if (isMobileDevice) {
        setShowLessons(false);
        setShowCodeEditor(false);
      } else {
        // Ensure panels are visible on desktop
        setShowLessons(true);
        setShowCodeEditor(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function initializeAuth() {
      setIsAuthenticating(true);

      // First, check if user is already logged in (session storage)
      const storedUser = getStoredUser();
      if (storedUser) {
        setCurrentUser(storedUser);
        setIsAuthenticating(false);
        return;
      }

      // If in iframe, attempt auto-login
      if (isInIframe()) {
        const user = await attemptAutoLogin();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticating(false);
          return;
        }
      }

      // No stored user and auto-login failed (or not in iframe), show login
      setIsAuthenticating(false);
      setShowLoginModal(true);
    }

    initializeAuth();

    // Clear session on window close
    const handleBeforeUnload = () => {
      logout();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    setIsLoggingIn(true);
    try {
      const user = await loginWithCredentials(username, password);
      if (user) {
        setCurrentUser(user);
        setShowLoginModal(false);
        addConsoleOutput(`Welcome, ${user.username}!`);
        return true;
      }
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    clearBlocks();
    clearConsole();
    setShowLoginModal(true);
    addConsoleOutput('Logged out successfully');
  };

  useEffect(() => {
    const lesson = LESSONS.find(l => l.id === currentLesson);
    if (lesson) {
      setCode(lesson.code);
    }
  }, [currentLesson]);

  const handleRunCode = async (codeToRun: string) => {
    setIsRunning(true);
    clearConsole();
    addConsoleOutput('Running code...');

    // Calculate offset to avoid overlapping with existing structures
    let offset = { x: 0, y: 0, z: 0 };
    if (autoOffsetEnabled && blocks.length > 0) {
      // Find the maximum X coordinate of existing blocks
      const maxX = Math.max(...blocks.map(b => b.position.x));
      // Place new structure 15 units to the right
      offset.x = maxX + 15;
      addConsoleOutput(`Placing new structure at offset X=${offset.x} to avoid overlaps`);
    }

    try {
      await executePythonCode(
        codeToRun,
        (x, y, z, material) => {
          addBlock({ position: { x, y, z }, material });
        },
        (message) => {
          addConsoleOutput(message);
        },
        () => {
          clearConsole();
        },
        isPositionOccupied,
        offset
      );
      addConsoleOutput('Code execution complete!');

      // Re-enable auto-offset after successful run
      if (!autoOffsetEnabled) {
        setAutoOffsetEnabled(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        addConsoleOutput(`Error: ${error.message}`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearWorld = () => {
    clearBlocks();
    clearConsole();
    setAutoOffsetEnabled(false);
    addConsoleOutput('World cleared!');
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson.id);
    clearBlocks();
    clearConsole();
    setAutoOffsetEnabled(false);
    addConsoleOutput('World cleared!');
  };

  const handleLoadExample = (exampleCode: string) => {
    setCode(exampleCode);
    clearBlocks();
    clearConsole();
    setAutoOffsetEnabled(false);
    addConsoleOutput('Example loaded! Click "Run Code" to execute.');
  };

  const handleGenerateCode = async (prompt: string) => {
    if (!currentUser || !currentUser.openaiApiKey) {
      addConsoleOutput('Error: OpenAI API key not available. Please log in again.');
      return;
    }

    setIsGeneratingCode(true);
    addConsoleOutput('Generating code from AI prompt...');

    try {
      const generatedCode = await generateCodeFromPrompt(prompt, currentUser.openaiApiKey);
      setCode(generatedCode);
      addConsoleOutput('Code generated successfully! Click "Run Code" to execute.');
      setAiInputText('');
    } catch (error) {
      if (error instanceof Error) {
        addConsoleOutput(`AI Error: ${error.message}`);
      } else {
        addConsoleOutput('Failed to generate code. Please try again.');
      }
    } finally {
      setIsGeneratingCode(false);
    }
  };

  if (isAuthenticating) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-blue-400 animate-spin" />
          <p className="text-gray-400 text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-screen flex flex-col bg-gray-950">
        {showLoginModal && (
          <LoginModal onLogin={handleLogin} isLoading={isLoggingIn} />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {showWelcomeModal && (
        <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
      )}

      {showPrivacyModal && (
        <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      {showTermsModal && (
        <TermsModal onClose={() => setShowTermsModal(false)} />
      )}

      {!isFullscreen3D && (
        <header className="bg-gradient-to-r from-blue-700 to-cyan-600 px-4 md:px-6 py-3 md:py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Boxes className="w-6 h-6 md:w-8 md:h-8 text-white" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-white">Code Blocks</h1>
                <p className="text-blue-100 text-xs md:text-sm hidden sm:block">Learn Python by Building in 3D</p>
              </div>
            </div>

            {isMobile ? (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                  <Settings className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-300">{currentUser.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-all hover:scale-110"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                </button>
                <form action="https://www.paypal.com/donate" method="post" target="_top" className="flex items-center">
                  <input type="hidden" name="hosted_button_id" value="PSXE6LDM3ZJDC" />
                  <input
                    type="image"
                    src="https://www.paypalobjects.com/en_AU/i/btn/btn_donateCC_LG.gif"
                    name="submit"
                    title="PayPal - The safer, easier way to pay online!"
                    alt="Donate with PayPal button"
                    className="h-8 w-auto hover:opacity-80 transition-opacity"
                  />
                </form>
                <a
                  href="https://digitalvector.com.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  title="Digital Vector"
                >
                  <img
                    src="/digivec_logo.png"
                    alt="Digital Vector"
                    className="h-16 w-auto"
                  />
                </a>
                <a
                  href="https://teachingtools.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-105"
                  title="Visit Teaching Tools"
                >
                  <Wrench className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">Teaching Tools</span>
                </a>
                <button
                  onClick={() => setShowLessons(!showLessons)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {showLessons ? 'Hide' : 'Show'} Lessons
                </button>
              </div>
            )}
          </div>

          {isMobile && showMobileMenu && (
            <div className="mt-3 pt-3 border-t border-white/20 flex flex-col gap-2">
              <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg">
                <Settings className="w-5 h-5 text-green-400" />
                <span className="text-white">{currentUser.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-white">Logout</span>
              </button>
              <a
                href="https://teachingtools.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg"
              >
                <Wrench className="w-5 h-5" />
                <span>Teaching Tools</span>
              </a>
            </div>
          )}
        </header>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {isFullscreen3D ? (
          <div className="w-full h-full bg-gray-900">
            <Scene3D blocks={blocks} blockCount={blockCount} />
            <button
              onClick={() => setIsFullscreen3D(false)}
              className="absolute top-4 right-4 z-10 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg text-sm md:text-base"
              title="Exit Fullscreen"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </button>
          </div>
        ) : isMobile ? (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 overflow-hidden relative">
              {mobileView === 'lessons' && (
                <div className="w-full h-full">
                  <LessonPanel
                    currentLessonId={currentLesson}
                    onSelectLesson={handleSelectLesson}
                  />
                </div>
              )}

              {mobileView === 'code' && (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    <CodeEditor
                      code={code}
                      onCodeChange={setCode}
                      onRunCode={handleRunCode}
                      onClearWorld={handleClearWorld}
                      isRunning={isRunning}
                    />
                  </div>
                  <ConsoleOutput
                    output={consoleOutput}
                    aiInputText={aiInputText}
                    onAiInputChange={setAiInputText}
                    onGenerateCode={handleGenerateCode}
                    isGenerating={isGeneratingCode}
                    hasApiKey={!!currentUser?.openaiApiKey}
                  />
                  <QuickExamples onLoadExample={handleLoadExample} />
                  <MaterialsPalette />
                </div>
              )}

              {mobileView === '3d' && (
                <div className="w-full h-full bg-gray-900">
                  <Scene3D blocks={blocks} blockCount={blockCount} />
                </div>
              )}
            </div>

            <div className="bg-gray-800 border-t border-gray-700 flex items-center justify-around py-3 px-2 safe-area-bottom">
              <button
                onClick={() => setMobileView('lessons')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  mobileView === 'lessons'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-xs font-medium">Lessons</span>
              </button>

              <button
                onClick={() => setMobileView('code')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  mobileView === 'code'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code className="w-6 h-6" />
                <span className="text-xs font-medium">Code</span>
              </button>

              <button
                onClick={() => setMobileView('3d')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  mobileView === '3d'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Box className="w-6 h-6" />
                <span className="text-xs font-medium">3D View</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {showLessons && (
              <>
                <div style={{ width: `${lessonsPanelWidth}px` }} className="border-gray-700 overflow-hidden relative flex-shrink-0">
                  <LessonPanel
                    currentLessonId={currentLesson}
                    onSelectLesson={handleSelectLesson}
                  />
                  <button
                    onClick={() => setShowLessons(false)}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-lg"
                    title="Hide Lessons"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                <ResizeHandle
                  direction="horizontal"
                  onResize={(delta) => {
                    setLessonsPanelWidth(prev => Math.max(200, Math.min(600, prev + delta)));
                  }}
                />
              </>
            )}

            {!showLessons && (
              <button
                onClick={() => setShowLessons(true)}
                className="absolute top-4 left-4 z-20 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
                title="Show Lessons"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <div className="flex-1 flex overflow-hidden relative">
              {showCodeEditor && (
                <>
                  <div style={{ width: `${codeEditorWidth}%` }} className="flex flex-col relative flex-shrink-0">
                    <div style={{ height: `calc(100% - ${consoleHeight}px)` }} className="overflow-hidden">
                      <CodeEditor
                        code={code}
                        onCodeChange={setCode}
                        onRunCode={handleRunCode}
                        onClearWorld={handleClearWorld}
                        isRunning={isRunning}
                      />
                    </div>
                    <ResizeHandle
                      direction="vertical"
                      onResize={(delta) => {
                        setConsoleHeight(prev => Math.max(100, Math.min(500, prev - delta)));
                      }}
                    />
                    <div style={{ height: `${consoleHeight}px` }} className="overflow-hidden">
                      <ConsoleOutput
                        output={consoleOutput}
                        aiInputText={aiInputText}
                        onAiInputChange={setAiInputText}
                        onGenerateCode={handleGenerateCode}
                        isGenerating={isGeneratingCode}
                        hasApiKey={!!currentUser?.openaiApiKey}
                      />
                    </div>
                    <QuickExamples onLoadExample={handleLoadExample} />
                    <MaterialsPalette />
                    <button
                      onClick={() => setShowCodeEditor(false)}
                      className="absolute top-4 left-4 z-10 p-2 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-lg"
                      title="Hide Code Editor"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                  <ResizeHandle
                    direction="horizontal"
                    onResize={(delta) => {
                      const containerWidth = window.innerWidth - (showLessons ? lessonsPanelWidth : 0);
                      const deltaPercent = (delta / containerWidth) * 100;
                      setCodeEditorWidth(prev => Math.max(20, Math.min(80, prev + deltaPercent)));
                    }}
                  />
                </>
              )}

              <div className="flex-1 bg-gray-900 relative">
                <Scene3D blocks={blocks} blockCount={blockCount} />
                {!showCodeEditor && (
                  <button
                    onClick={() => setShowCodeEditor(true)}
                    className="absolute top-4 left-4 z-10 p-2 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-lg"
                    title="Show Code Editor"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setIsFullscreen3D(true)}
                  className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                  title="Fullscreen 3D View"
                >
                  <Maximize2 className="w-4 h-4" />
                  Fullscreen
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {!isFullscreen3D && !isMobile && (
        <footer className="bg-gray-900 border-t border-gray-700 relative">
          <button
            onClick={() => setIsFooterCollapsed(!isFooterCollapsed)}
            className="absolute -top-8 right-4 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white p-2 rounded-t-lg transition-colors shadow-lg"
            title={isFooterCollapsed ? "Show footer" : "Hide footer"}
          >
            {isFooterCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {!isFooterCollapsed && (
            <div className="px-6 py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                <div className="flex flex-col items-center md:items-start gap-1">
                  <p className="text-gray-300">© 2025 Digital Vector. Educational use only.</p>
                  <p className="text-xs">Compliant with Australian Privacy Principles (APPs) & Australian Curriculum standards.</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="hover:text-blue-400 transition-colors"
                  >
                    Privacy Policy
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    onClick={() => setShowTermsModal(true)}
                    className="hover:text-blue-400 transition-colors"
                  >
                    Terms of Use
                  </button>
                  <span className="text-gray-600">|</span>
                  <a
                    href="https://clarence.guru/#contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Contact
                  </a>
                  <span className="text-gray-600">|</span>
                  <a
                    href="https://www.australiancurriculum.edu.au/f-10-curriculum/technologies/digital-technologies/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Australian Curriculum
                  </a>
                </div>
              </div>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}

export default App;
