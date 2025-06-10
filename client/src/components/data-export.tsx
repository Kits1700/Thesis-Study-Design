import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useStudyStore } from "@/lib/study-store";

export default function DataExport() {
  const { exportStudyData, participantId, completedTasks, questionnaireResponses } = useStudyStore();

  const downloadData = () => {
    const studyData = exportStudyData();
    const dataStr = JSON.stringify(studyData, null, 2);
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}