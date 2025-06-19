import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download } from "lucide-react";
import { useStudyStore } from "@/lib/study-store";
import ComprehensiveDataExport from "./comprehensive-data-export";

export default function CompletionScreen() {
  const { participantId, completedTasks, questionnaireResponses } = useStudyStore();

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">🎉 Study Complete!</h1>
          <p className="text-gray-300 text-lg">
            Thank you for participating in this research study. Your data has been saved successfully.
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                  Study Summary
                </h2>
                <div className="space-y-3 text-gray-300">
                  <p>Participant ID: <span className="font-mono text-blue-400">{participantId}</span></p>
                  <p>Tasks Completed: <span className="text-green-400">{completedTasks.length}/4</span></p>
                  <p>Questionnaires: <span className="text-green-400">{questionnaireResponses.length}</span></p>
                  <p>Study Duration: <span className="text-blue-400">Complete</span></p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Download className="w-6 h-6 text-blue-400 mr-2" />
                  Data Export
                </h2>
                <p className="text-gray-300 mb-4 text-sm">
                  Your study data is available for download and has been automatically saved to the research database.
                </p>
                <ComprehensiveDataExport />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Thank You for Your Participation
              </h3>
              <p className="text-gray-300 text-sm">
                Your contributions help advance our understanding of AI-human collaboration.
                You may now close this window.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}