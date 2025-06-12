import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { useStudyStore } from "@/lib/study-store";

export default function ComprehensiveDataExport() {
  const { exportStudyData, participantId, completedTasks, questionnaireResponses } = useStudyStore();

  const downloadOrganizedData = () => {
    const studyData = exportStudyData();
    
    // Create the organized structure you requested
    const organizedParticipantData = {
      "PARTICIPANT_ID": studyData.participantId,
      "STUDY_METADATA": {
        startTime: studyData.startTime,
        currentStep: studyData.currentStep,
        browser: studyData.studyMetadata.browser,
        screenResolution: studyData.studyMetadata.screenResolution,
        timezone: studyData.studyMetadata.timezone
      },
      "QUESTIONNAIRE_RESPONSES": {
        "Task_Questionnaires": studyData.questionnaireResponses
          .filter(q => q.taskId !== 999)
          .map(q => ({
            taskId: q.taskId,
            submittedAt: q.submittedAt,
            responses: q.responses
          })),
        "Final_Study_Questionnaire": studyData.questionnaireResponses
          .find(q => q.taskId === 999) || null
      },
      "TASK_DATA": studyData.completedTasks.map(task => ({
        [`Task_${task.taskId}_Data`]: {
          taskType: task.taskType,
          frictionType: task.frictionType,
          topic: task.topic,
          initialThoughts: task.initialThoughts,
          counterarguments: task.counterarguments,
          generatedContent: task.generatedContent,
          completedAt: task.completedAt,
          aiGeneratedReview: task.generatedContent?.literatureReview || task.generatedContent?.argumentExploration || null,
          userInputs: task.generatedContent?.userPrompts || null,
          paperAbstracts: task.generatedContent?.paperAbstracts || null
        }
      }))
    };
    
    const dataStr = JSON.stringify(organizedParticipantData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `participant_${participantId}_complete_data.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          JSON Responses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download participant data with questionnaire responses and task information in JSON format.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-muted p-3 rounded">
              <div className="font-semibold">Participant ID</div>
              <div>{participantId}</div>
            </div>
            <div className="bg-muted p-3 rounded">
              <div className="font-semibold">Completed Tasks</div>
              <div>{completedTasks.length}</div>
            </div>
            <div className="bg-muted p-3 rounded">
              <div className="font-semibold">Questionnaire Responses</div>
              <div>{questionnaireResponses.length}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button onClick={downloadOrganizedData} variant="default" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Download JSON Responses
            </Button>
            
            <div className="text-xs text-muted-foreground">
              <div>Structured data with clear sections for questionnaire responses and task data.</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}