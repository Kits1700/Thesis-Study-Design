import { useStudyStore } from "@/lib/study-store";

export default function StudyHeader() {
  const { participantId, currentStep, progress } = useStudyStore();

  const getStudyTitle = () => {
    switch (currentStep) {
      case "literature_review":
        return "Literature Review Task - Selective Friction AI Assistance";
      case "argument_exploration":
        return "Argument Exploration Task - Full AI Assistance";
      case "questionnaire":
        return "Task Questionnaire";
      case "completion":
        return "Study Complete";
      default:
        return "AI-Human Interaction Research Study";
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 py-4">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div>
          <h1 className="text-sm font-medium text-gray-300">
            {getStudyTitle()}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Participant ID: <span className="font-mono">{participantId}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-300">Progress</span>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
