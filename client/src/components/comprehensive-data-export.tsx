import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Database } from "lucide-react";
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

  const downloadReadableReport = () => {
    const studyData = exportStudyData();
    
    let report = `STUDY DATA REPORT\n`;
    report += `=====================================\n\n`;
    
    report += `PARTICIPANT ID: ${studyData.participantId}\n\n`;
    
    report += `STUDY METADATA:\n`;
    report += `- Start Time: ${studyData.startTime}\n`;
    report += `- Current Step: ${studyData.currentStep}\n`;
    report += `- Browser: ${studyData.studyMetadata.browser}\n`;
    report += `- Screen Resolution: ${studyData.studyMetadata.screenResolution}\n`;
    report += `- Timezone: ${studyData.studyMetadata.timezone}\n\n`;
    
    report += `QUESTIONNAIRE RESPONSES:\n`;
    report += `=====================================\n`;
    
    // Task questionnaires
    const taskQuestionnaires = studyData.questionnaireResponses.filter(q => q.taskId !== 999);
    if (taskQuestionnaires.length > 0) {
      taskQuestionnaires.forEach(questionnaire => {
        report += `\nTask ${questionnaire.taskId} Questionnaire:\n`;
        report += `- Submitted: ${questionnaire.submittedAt}\n`;
        report += `- Responses:\n`;
        Object.entries(questionnaire.responses).forEach(([key, value]) => {
          report += `  * ${key}: ${value}\n`;
        });
      });
    }
    
    // Final questionnaire
    const finalQuestionnaire = studyData.questionnaireResponses.find(q => q.taskId === 999);
    if (finalQuestionnaire) {
      report += `\nFinal Study Questionnaire:\n`;
      report += `- Submitted: ${finalQuestionnaire.submittedAt}\n`;
      report += `- Responses:\n`;
      Object.entries(finalQuestionnaire.responses).forEach(([key, value]) => {
        report += `  * ${key}: ${value}\n`;
      });
    }
    
    report += `\n\nTASK DATA:\n`;
    report += `=====================================\n`;
    
    studyData.completedTasks.forEach(task => {
      report += `\nTask ${task.taskId} Data:\n`;
      report += `- Task Type: ${task.taskType}\n`;
      report += `- Friction Type: ${task.frictionType}\n`;
      report += `- Topic: ${task.topic || 'Not specified'}\n`;
      report += `- Completed: ${task.completedAt}\n`;
      
      if (task.initialThoughts) {
        report += `- Initial Thoughts:\n  ${task.initialThoughts}\n`;
      }
      
      if (task.counterarguments) {
        report += `- Counterarguments:\n  ${task.counterarguments}\n`;
      }
      
      if (task.generatedContent) {
        report += `- Generated Content:\n`;
        
        // Show AI-generated literature review or argument exploration
        if (task.generatedContent.literatureReview) {
          report += `  * Literature Review (AI Generated):\n`;
          report += `    ${task.generatedContent.literatureReview}\n\n`;
        }
        
        if (task.generatedContent.argumentExploration) {
          report += `  * Argument Exploration (AI Generated):\n`;
          report += `    ${task.generatedContent.argumentExploration}\n\n`;
        }
        
        // Show user inputs and prompts
        if (task.generatedContent.userPrompts) {
          report += `  * User Input Details:\n`;
          if (task.generatedContent.userPrompts.topic) {
            report += `    - Topic: ${task.generatedContent.userPrompts.topic}\n`;
          }
          if (task.generatedContent.userPrompts.initialThoughts) {
            report += `    - Initial Thoughts: ${task.generatedContent.userPrompts.initialThoughts}\n`;
          }
          if (task.generatedContent.userPrompts.counterarguments) {
            report += `    - Counterarguments: ${task.generatedContent.userPrompts.counterarguments}\n`;
          }
        }
        
        // Show paper abstracts for literature review tasks
        if (task.generatedContent.paperAbstracts && task.generatedContent.paperAbstracts.length > 0) {
          report += `  * Paper Abstracts (User Input):\n`;
          task.generatedContent.paperAbstracts.forEach((paper, index) => {
            report += `    ${index + 1}. ${paper.abstract}\n`;
          });
        }
      }
      report += `\n`;
    });
    
    const reportUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(report);
    const exportFileDefaultName = `participant_${participantId}_report.txt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', reportUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadCSVFormat = () => {
    const studyData = exportStudyData();
    
    // Create comprehensive CSV with all data
    const csvHeader = [
      'Participant_ID', 'Data_Type', 'Task_ID', 'Section', 'Key', 'Value', 'Timestamp'
    ].join(',');
    
    const csvRows = [];
    
    // Add participant metadata
    csvRows.push([
      studyData.participantId, 'Metadata', '', 'Start_Time', '', studyData.startTime, studyData.startTime
    ].join(','));
    csvRows.push([
      studyData.participantId, 'Metadata', '', 'Browser', '', studyData.studyMetadata.browser, studyData.startTime
    ].join(','));
    csvRows.push([
      studyData.participantId, 'Metadata', '', 'Screen_Resolution', '', studyData.studyMetadata.screenResolution, studyData.startTime
    ].join(','));
    csvRows.push([
      studyData.participantId, 'Metadata', '', 'Timezone', '', studyData.studyMetadata.timezone, studyData.startTime
    ].join(','));
    
    // Add task data
    studyData.completedTasks.forEach(task => {
      csvRows.push([
        studyData.participantId, 'Task_Data', task.taskId, 'Task_Type', '', task.taskType, task.completedAt
      ].join(','));
      csvRows.push([
        studyData.participantId, 'Task_Data', task.taskId, 'Friction_Type', '', task.frictionType, task.completedAt
      ].join(','));
      if (task.topic) {
        csvRows.push([
          studyData.participantId, 'Task_Data', task.taskId, 'Topic', '', `"${task.topic.replace(/"/g, '""')}"`, task.completedAt
        ].join(','));
      }
      if (task.initialThoughts) {
        csvRows.push([
          studyData.participantId, 'Task_Data', task.taskId, 'Initial_Thoughts', '', `"${task.initialThoughts.replace(/"/g, '""')}"`, task.completedAt
        ].join(','));
      }
      if (task.counterarguments) {
        csvRows.push([
          studyData.participantId, 'Task_Data', task.taskId, 'Counterarguments', '', `"${task.counterarguments.replace(/"/g, '""')}"`, task.completedAt
        ].join(','));
      }
    });
    
    // Add questionnaire responses
    studyData.questionnaireResponses.forEach(response => {
      const questionnaireType = response.taskId === 999 ? 'Final_Questionnaire' : 'Task_Questionnaire';
      Object.entries(response.responses).forEach(([key, value]) => {
        csvRows.push([
          studyData.participantId, 'Questionnaire', response.taskId, questionnaireType, key, `"${String(value).replace(/"/g, '""')}"`, response.submittedAt
        ].join(','));
      });
    });
    
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const csvUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    const exportFileDefaultName = `participant_${participantId}_data.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', csvUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Complete Study Data Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export all study data organized by participant with clear sections for questionnaire responses and task data.
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
            <div className="flex gap-3">
              <Button onClick={downloadOrganizedData} variant="default" className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                Organized JSON
              </Button>
              <Button onClick={downloadReadableReport} variant="outline" className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                Readable Report
              </Button>
              <Button onClick={downloadCSVFormat} variant="outline" className="flex-1">
                <Database className="w-4 h-4 mr-2" />
                CSV Data
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• <strong>Organized JSON:</strong> Structured data with clear sections for questionnaires and tasks</div>
              <div>• <strong>Readable Report:</strong> Human-readable text format with all participant information</div>
              <div>• <strong>CSV Data:</strong> Spreadsheet-compatible format for data analysis</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}