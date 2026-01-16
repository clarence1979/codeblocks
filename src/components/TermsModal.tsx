import { X } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
}

export function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Terms of Use & Disclaimer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-6 text-gray-300 space-y-6">
          <p className="text-sm text-gray-400">Last Updated: October 2025</p>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Educational Purpose</h3>
            <p>Code Blocks is an educational tool designed to teach Python programming and computational thinking through interactive 3D visualization. It is suitable for use in Australian schools and educational institutions. Users can export their creations as STL files for 3D printing or use in animation projects.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Acceptable Use</h3>
            <p className="mb-3">This application is provided for educational purposes. Users agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the application in accordance with applicable laws and regulations</li>
              <li>Not attempt to disrupt or interfere with the application's functionality</li>
              <li>Use appropriate language and content when sharing work with others</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Disclaimer of Warranties</h3>
            <p className="mb-3">This application is provided "as is" without warranties of any kind, either express or implied, including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accuracy, reliability, or completeness of content</li>
              <li>Fitness for a particular purpose</li>
              <li>Uninterrupted or error-free operation</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h3>
            <p>The developers and maintainers of Code Blocks shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use or inability to use this application, including but not limited to loss of data or educational progress.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Supervision Requirements</h3>
            <p>When used in educational settings, appropriate adult supervision is recommended. Teachers and educators should:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Review content before presenting to students</li>
              <li>Provide guidance on appropriate use</li>
              <li>Monitor student activity as per school policies</li>
              <li>Ensure compliance with the Australian Curriculum standards</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Australian Curriculum Alignment</h3>
            <p>Code Blocks supports learning objectives from the Australian Curriculum: Digital Technologies, particularly in the areas of:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Design thinking and computational thinking</li>
              <li>Algorithm design and implementation</li>
              <li>Programming concepts and problem-solving</li>
              <li>Digital literacy and creative expression</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Technical Requirements</h3>
            <p className="mb-3">For optimal performance, users should:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use a modern web browser (Chrome, Firefox, Safari, or Edge)</li>
              <li>Have a stable internet connection for initial loading</li>
              <li>Enable JavaScript in their browser</li>
              <li>Use a device with adequate processing power for 3D rendering</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Intellectual Property</h3>
            <p>Code Blocks is provided as free educational software. Users retain ownership of any code they create using the application. The application itself and its original content remain the property of Digital Vector.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">No Warranty for Internet Safety</h3>
            <p>While this application does not collect personal information, users should follow their school's or institution's internet safety policies and guidelines when using any online educational tool.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Modifications to Terms</h3>
            <p>These terms may be updated periodically. Continued use of the application constitutes acceptance of any changes.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Governing Law</h3>
            <p>These terms are governed by the laws of Australia. Any disputes shall be subject to the exclusive jurisdiction of Australian courts.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Contact</h3>
            <p>For questions, support, or concerns regarding these terms:</p>
            <p className="mt-2">
              <a href="https://digitalvector.com.au" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                Contact Digital Vector
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
