import { X } from 'lucide-react';

interface PrivacyModalProps {
  onClose: () => void;
}

export function PrivacyModal({ onClose }: PrivacyModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-6 text-gray-300 space-y-6">
          <p className="text-sm text-gray-400">Last Updated: November 2026</p>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h3>
            <p className="mb-3">Code Blocks is designed with privacy in mind. This application:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Does not collect, store, or transmit any personal information</li>
              <li>Does not require user accounts or registration</li>
              <li>Does not use cookies for tracking purposes</li>
              <li>Runs in your web browser, including Python, which is built into the page</li>
              <li>Does not store any code you write on external servers</li>
              <li>Only sends anything over the internet when you use the optional AI Input (see below)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">2. How We Use Information</h3>
            <p>All code you write and 3D worlds you create remain local to your browser session. No data is sent to external servers for storage or analysis.</p>
            <p className="mt-3"><strong>AI Input (optional):</strong> when you press Generate Code, the description you typed or spoke is sent to OpenAI so it can write Python for you. If you opened Code Blocks from teachingtools.dev, the request goes through the teachingtools.dev service using your school's AI access. Otherwise it goes straight to OpenAI using an API key you enter. Your own key is checked with OpenAI, kept only in this browser's storage, never shown on screen, and removed when you press "Forget my key". Speech input uses your browser's built-in speech recognition, which may be processed by your browser's maker.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">3. Third-Party Services</h3>
            <p className="mb-3">This application uses:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Pyodide:</strong> A Python runtime that executes entirely in your browser</li>
              <li><strong>OpenAI:</strong> Only when you use the AI Input (directly, or through teachingtools.dev)</li>
              <li><strong>PayPal:</strong> For optional donations (only if you choose to donate)</li>
            </ul>
            <p className="mt-3">No analytics, tracking, or advertising services are used.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">4. Data Security</h3>
            <p>No personal data is collected or stored by Code Blocks. All code execution happens locally in your browser. Remind students not to type personal information into the AI Input.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">5. Children's Privacy</h3>
            <p>This application is safe for use by children and complies with educational privacy standards. We do not knowingly collect any information from children or any users.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">6. Australian Privacy Principles</h3>
            <p>This application complies with the Australian Privacy Principles (APPs) under the Privacy Act 1988. As no personal information is collected, there are no privacy concerns regarding data handling, storage, or disclosure.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">7. Contact Information</h3>
            <p>For privacy-related questions or concerns, please contact:</p>
            <p className="mt-2">
              <a href="https://digitalvector.com.au" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                Digital Vector
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
