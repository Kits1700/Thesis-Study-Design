import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Participant {
  id: number;
  participantId: string;
  currentStep: string;
  startTime: string;
  completedAt: string | null;
  studyData: any;
}

interface Task {
  id: number;
  participantId: string;
  taskId: number;
  taskType: string;
  frictionType: string;
  topic: string | null;
  initialThoughts: string | null;
  counterarguments: string | null;
  generatedContent: any;
  startTime: string;
  completedAt: string | null;
}

interface Questionnaire {
  id: number;
  participantId: string;
  taskId: number;
  responses: any;
  submittedAt: string;
}

export default function AdminPage() {
  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ['/api/admin/participants'],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/admin/tasks'],
  });

  const { data: questionnaires, isLoading: questionnairesLoading } = useQuery({
    queryKey: ['/api/admin/questionnaires'],
  });

  if (participantsLoading || tasksLoading || questionnairesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Study Data Admin</h1>
        <p className="text-muted-foreground">View all participant responses and study data</p>
      </div>

      {/* Participants Section */}
      <Card>
        <CardHeader>
          <CardTitle>Participants ({participants?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {participants?.map((participant: Participant) => (
                <div key={participant.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">ID: {participant.participantId}</div>
                    <Badge variant={participant.completedAt ? "default" : "secondary"}>
                      {participant.completedAt ? "Completed" : participant.currentStep}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Started: {new Date(participant.startTime).toLocaleString()}
                    {participant.completedAt && (
                      <span> • Completed: {new Date(participant.completedAt).toLocaleString()}</span>
                    )}
                  </div>
                  {Object.keys(participant.studyData || {}).length > 0 && (
                    <div className="text-sm">
                      <div className="font-medium">Study Data:</div>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(participant.studyData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )) || <div className="text-center text-muted-foreground">No participants yet</div>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({tasks?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {tasks?.map((task: Task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">
                      Participant {task.participantId} - Task {task.taskId}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{task.taskType}</Badge>
                      <Badge variant="outline">{task.frictionType}</Badge>
                      <Badge variant={task.completedAt ? "default" : "secondary"}>
                        {task.completedAt ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                  {task.topic && (
                    <div className="text-sm">
                      <span className="font-medium">Topic:</span> {task.topic}
                    </div>
                  )}
                  {task.initialThoughts && (
                    <div className="text-sm">
                      <span className="font-medium">Initial Thoughts:</span>
                      <div className="bg-muted p-2 rounded mt-1">{task.initialThoughts}</div>
                    </div>
                  )}
                  {task.counterarguments && (
                    <div className="text-sm">
                      <span className="font-medium">Counterarguments:</span>
                      <div className="bg-muted p-2 rounded mt-1">{task.counterarguments}</div>
                    </div>
                  )}
                  {Object.keys(task.generatedContent || {}).length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Generated Content:</span>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                        {JSON.stringify(task.generatedContent, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Started: {new Date(task.startTime).toLocaleString()}
                    {task.completedAt && (
                      <span> • Completed: {new Date(task.completedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              )) || <div className="text-center text-muted-foreground">No tasks yet</div>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Questionnaires Section */}
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Responses ({questionnaires?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {questionnaires?.map((questionnaire: Questionnaire) => (
                <div key={questionnaire.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">
                      Participant {questionnaire.participantId} - Task {questionnaire.taskId}
                    </div>
                    <Badge variant="default">Submitted</Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Responses:</span>
                    <div className="bg-muted p-3 rounded mt-1 space-y-2">
                      {Object.entries(questionnaire.responses || {}).map(([question, answer]) => (
                        <div key={question} className="text-sm">
                          <div className="font-medium text-foreground">{question}:</div>
                          <div className="text-muted-foreground ml-2">{String(answer)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Submitted: {new Date(questionnaire.submittedAt).toLocaleString()}
                  </div>
                </div>
              )) || <div className="text-center text-muted-foreground">No questionnaire responses yet</div>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}