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
    <header className="surface border-b border-border py-4">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div>
          <h1 className="text-sm font-medium text-secondary">
            {getStudyTitle()}
          </h1>
          <p className="text-xs text-secondary mt-1">
            Participant ID: <span className="font-mono">{participantId}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-secondary">Progress</span>
          <div className="w-32 h-2 bg-surface-variant rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300 progress-bar" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
