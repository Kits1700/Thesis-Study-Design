import { Button } from "@/components/ui/button";
import { useStudyStore } from "@/lib/study-store";
import { Clock, Smartphone, User } from "lucide-react";

export default function TaskOverview() {
  const { setCurrentStep } = useStudyStore();

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Encouraging Thought Before Completion
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-300 mb-3">
            The Role of Friction in AI - Assisted Tasks
          </h2>
          <p className="text-gray-400 italic text-lg">
            Exploring how reflective pauses influence user engagement and critical thinking in AI-powered workflows
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-semibold mb-4">What you'll do</h3>
          <p className="text-gray-300 mb-8">
            You'll complete two types of tasks with different levels of AI assistance to help us understand 
            how friction affects thinking.
          </p>

          {/* Task Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold text-white">Literature Review</h4>
                <p className="text-gray-400 text-sm">Generate comprehensive reviews with AI assistance</p>
              </div>
            </div>
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold text-white">Argument Exploration</h4>
                <p className="text-gray-400 text-sm">Develop complex arguments with AI support</p>
              </div>
            </div>
          </div>

          {/* Two Conditions */}
          <div>
            <h4 className="font-semibold mb-4">Two Conditions</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-black font-bold text-xs">
                  1
                </div>
                <span className="text-gray-300">Full AI assistance with immediate access</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  2
                </div>
                <span className="text-gray-300">AI assistance with brief reflection step</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-white font-medium">60 minutes</div>
            <div className="text-gray-400 text-sm">Estimated Duration</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-white font-medium">Interactive</div>
            <div className="text-gray-400 text-sm">Digital tasks</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-white font-medium">Voluntary</div>
            <div className="text-gray-400 text-sm">Participation</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button 
            onClick={() => setCurrentStep("important_notes")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-lg mb-3"
          >
            Begin Study
          </Button>
          <p className="text-gray-400 text-sm">
            By proceeding, you consent to participate in this research study
          </p>
        </div>
      </div>
    </div>
  );
}
