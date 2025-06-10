import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useStudyStore } from "@/lib/study-store";

export default function DataExport() {
  const { exportStudyData, participantId, completedTasks, questionnaireResponses } = useStudyStore();

  const downloadData = () => {
    const studyData = exportStudyData();
    
    // Organize data by participant with clear sections
    const organizedData = {
      participantId: studyData.participantId,
      studyMetadata: {
        startTime: studyData.startTime,
        currentStep: studyData.currentStep,
        browser: studyData.studyMetadata.browser,
        screenResolution: studyData.studyMetadata.screenResolution,
        timezone: studyData.studyMetadata.timezone
      },
      questionnaireResponses: {
        taskQuestionnaires: studyData.questionnaireResponses.filter(q => q.taskId !== 999),
        finalQuestionnaire: studyData.questionnaireResponses.find(q => q.taskId === 999) || null
      },
      taskData: studyData.completedTasks.map(task => ({
        taskId: task.taskId,
        taskType: task.taskType,
        frictionType: task.frictionType,
        topic: task.topic,
        initialThoughts: task.initialThoughts,
        counterarguments: task.counterarguments,
        generatedContent: task.generatedContent,
        completedAt: task.completedAt
      }))
    };
    
    const dataStr = JSON.stringify(organizedData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `study_data_${participantId}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadCSV = () => {
    const studyData = exportStudyData();
    
    // Create CSV header
    const csvHeader = [
      'participantId', 'startTime', 'currentStep', 'taskId', 'taskType', 
      'frictionType', 'topic', 'completedAt', 'questionnaireTaskId', 
      'questionnaireResponses', 'submittedAt', 'browser', 'screenResolution', 'timezone'
    ].join(',');
    
    // Create CSV rows
    const csvRows = [];
    
    // Add basic participant info
    csvRows.push([
      studyData.participantId,
      studyData.startTime,
      studyData.currentStep,
      '', '', '', '', '', '', '', '',
      studyData.studyMetadata.browser,
      studyData.studyMetadata.screenResolution,
      studyData.studyMetadata.timezone
    ].join(','));
    
    // Add completed tasks
    studyData.completedTasks.forEach(task => {
      csvRows.push([
        studyData.participantId,
        studyData.startTime,
        studyData.currentStep,
        task.taskId,
        task.taskType,
        task.frictionType,
        task.topic,
        task.completedAt,
        '', '', '', '', '', ''
      ].join(','));
    });
    
    // Add questionnaire responses
    studyData.questionnaireResponses.forEach(response => {
      csvRows.push([
        studyData.participantId,
        studyData.startTime,
        studyData.currentStep,
        '', '', '', '',
        response.taskId,
        JSON.stringify(response.responses).replace(/,/g, ';'),
        response.submittedAt,
        '', '', '', ''
      ].join(','));
    });
    
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const csvUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    const exportFileDefaultName = `study_data_${participantId}_${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', csvUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadReadableText = () => {
    const studyData = exportStudyData();
    
    // Create human-readable text format
    let textContent = `STUDY DATA EXPORT\n`;
    textContent += `==========================================\n\n`;
    
    textContent += `PARTICIPANT ID: ${studyData.participantId}\n\n`;
    
    textContent += `STUDY METADATA:\n`;
    textContent += `- Start Time: ${studyData.startTime}\n`;
    textContent += `- Current Step: ${studyData.currentStep}\n`;
    textContent += `- Browser: ${studyData.studyMetadata.browser}\n`;
    textContent += `- Screen Resolution: ${studyData.studyMetadata.screenResolution}\n`;
    textContent += `- Timezone: ${studyData.studyMetadata.timezone}\n\n`;
    
    textContent += `QUESTIONNAIRE RESPONSES:\n`;
    textContent += `==========================================\n`;
    
    // Task questionnaires
    const taskQuestionnaires = studyData.questionnaireResponses.filter(q => q.taskId !== 999);
    taskQuestionnaires.forEach(questionnaire => {
      textContent += `\nTask ${questionnaire.taskId} Questionnaire:\n`;
      textContent += `- Submitted: ${questionnaire.submittedAt}\n`;
      textContent += `- Responses:\n`;
      Object.entries(questionnaire.responses).forEach(([key, value]) => {
        textContent += `  * ${key}: ${value}\n`;
      });
    });
    
    // Final questionnaire
    const finalQuestionnaire = studyData.questionnaireResponses.find(q => q.taskId === 999);
    if (finalQuestionnaire) {
      textContent += `\nFinal Study Questionnaire:\n`;
      textContent += `- Submitted: ${finalQuestionnaire.submittedAt}\n`;
      textContent += `- Responses:\n`;
      Object.entries(finalQuestionnaire.responses).forEach(([key, value]) => {
        textContent += `  * ${key}: ${value}\n`;
      });
    }
    
    textContent += `\n\nTASK DATA:\n`;
    textContent += `==========================================\n`;
    
    studyData.completedTasks.forEach(task => {
      textContent += `\nTask ${task.taskId} Data:\n`;
      textContent += `- Task Type: ${task.taskType}\n`;
      textContent += `- Friction Type: ${task.frictionType}\n`;
      textContent += `- Topic: ${task.topic}\n`;
      textContent += `- Completed: ${task.completedAt}\n`;
      
      if (task.initialThoughts) {
        textContent += `- Initial Thoughts: ${task.initialThoughts}\n`;
      }
      
      if (task.counterarguments) {
        textContent += `- Counterarguments: ${task.counterarguments}\n`;
      }
      
      if (task.generatedContent) {
        textContent += `- Generated Content:\n`;
        if (typeof task.generatedContent === 'object') {
          Object.entries(task.generatedContent).forEach(([key, value]) => {
            textContent += `  * ${key}: ${JSON.stringify(value, null, 2)}\n`;
          });
        } else {
          textContent += `  ${task.generatedContent}\n`;
        }
      }
      textContent += `\n`;
    });
    
    const textUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent);
    const exportFileDefaultName = `study_data_${participantId}_${new Date().toISOString().split('T')[0]}.txt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', textUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Study Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download your complete study data including all tasks, responses, and metadata.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-muted p-3 rounded">
              <div className="font-semibold">Completed Tasks</div>
              <div>{completedTasks.length}</div>
            </div>
            <div className="bg-muted p-3 rounded">
              <div className="font-semibold">Questionnaire Responses</div>
              <div>{questionnaireResponses.length}</div>
            </div>
            <div className="bg-muted p-3 rounded">
              <div className="font-semibold">Participant ID</div>
              <div>{participantId}</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={downloadData} variant="outline">
              Download JSON
            </Button>
            <Button onClick={downloadCSV} variant="outline">
              Download CSV
            </Button>
            <Button onClick={downloadReadableText} variant="outline">
              Download Readable Format
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}