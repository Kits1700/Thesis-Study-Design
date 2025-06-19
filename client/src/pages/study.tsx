import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStudyStore } from "@/lib/study-store";
import StudyHeader from "@/components/study-header";
import TaskOverview from "@/components/task-overview";
import ImportantNotes from "@/components/important-notes";
import PreStudyQuestionnaire from "@/components/pre-study-questionnaire";
import TaskSelection from "@/components/task-selection";
import LiteratureReview from "@/components/literature-review";
import ArgumentExploration from "@/components/argument-exploration";
import Questionnaire from "@/components/questionnaire";
import FinalQuestionnaire from "@/components/final-questionnaire";
import CompletionScreen from "@/components/completion-screen";
import HelpTooltip from "@/components/ui/help-tooltip";

export default function StudyPage() {
  const { 
    participantId, 
    currentStep, 
    initializeParticipant, 
    updateProgress,
    resetStudy
  } = useStudyStore();

  // Reset study data on first load to ensure clean state
  useEffect(() => {
    resetStudy();
  }, []);

  const { data: participant } = useQuery({
    queryKey: [`/api/participant/${participantId}`],
    enabled: !!participantId,
  });

  useEffect(() => {
    if (!participantId) {
      const id = generateParticipantId();
      initializeParticipant(id);
    }
  }, [participantId, initializeParticipant]);

  useEffect(() => {
    updateProgress();
  }, [currentStep, updateProgress]);

  function generateParticipantId(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "overview":
        return <TaskOverview />;
      case "important_notes":
        return <ImportantNotes />;
      case "pre_study_questionnaire":
        return <PreStudyQuestionnaire />;
      case "task_selection":
        return <TaskSelection />;
      case "literature_review":
        return <LiteratureReview />;
      case "argument_exploration":
        return <ArgumentExploration />;
      case "questionnaire":
        return <Questionnaire />;
      case "final_questionnaire":
        return <FinalQuestionnaire />;
      case "completion":
        return <CompletionScreen />;
      default:
        return <TaskOverview />;
    }
  };

  if (!participantId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Initializing study...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StudyHeader />
      <main>
        {renderCurrentStep()}
      </main>
      <HelpTooltip />
    </div>
  );
}
