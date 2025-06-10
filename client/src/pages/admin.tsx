import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Database, Users, ClipboardCheck, Brain, ChevronDown, MessageSquare, FileText } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

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
  prompts: any;
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
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const { data: participants = [], isLoading: participantsLoading } = useQuery<Participant[]>({
    queryKey: ['/api/admin/participants'],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/admin/tasks'],
  });

  const { data: questionnaires = [], isLoading: questionnairesLoading } = useQuery<Questionnaire[]>({
    queryKey: ['/api/admin/questionnaires'],
  });

  const participantCount = Array.isArray(participants) ? participants.length : 0;
  const taskCount = Array.isArray(tasks) ? tasks.length : 0;
  const questionnaireCount = Array.isArray(questionnaires) ? questionnaires.length : 0;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatResponses = (responses: any) => {
    if (!responses || typeof responses !== 'object') return {};
    return Object.entries(responses).reduce((acc, [key, value]) => {
      const friendlyKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      acc[friendlyKey] = value;
      return acc;
    }, {} as Record<string, any>);
  };

  if (participantsLoading || tasksLoading || questionnairesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  // Group data by participant with organized structure
  const participantData = participants.map((participant: Participant) => {
    const participantTasks = tasks.filter((task: Task) => task.participantId === participant.participantId);
    const participantQuestionnaires = questionnaires.filter((q: Questionnaire) => q.participantId === participant.participantId);
    
    // Organize questionnaires by type
    const taskQuestionnaires = participantQuestionnaires.filter(q => q.taskId !== 999);
    const finalQuestionnaire = participantQuestionnaires.find(q => q.taskId === 999);
    
    return { 
      participant, 
      tasks: participantTasks, 
      questionnaires: {
        taskQuestionnaires,
        finalQuestionnaire
      }
    };
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Admin Dashboard</h1>
          <p className="text-muted-foreground">Human-LLM Interaction Study Data Management</p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Back to Study
          </Button>
        </Link>
      </div>

      {/* Data Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participantCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered study participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCount}</div>
            <p className="text-xs text-muted-foreground">
              Literature reviews and argument explorations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Survey Responses</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questionnaireCount}</div>
            <p className="text-xs text-muted-foreground">
              Questionnaire submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Participant Data Display */}
      {participantData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Participant Responses & Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[800px]">
              <div className="space-y-6">
                {participantData.map(({ participant, tasks: participantTasks, questionnaires }) => (
                  <div key={participant.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Participant {participant.participantId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Started: {new Date(participant.startTime).toLocaleString()}
                          {participant.completedAt && (
                            <span> • Completed: {new Date(participant.completedAt).toLocaleString()}</span>
                          )}
                        </p>
                      </div>
                      <Badge variant={participant.completedAt ? "default" : "secondary"}>
                        {participant.completedAt ? "Completed" : participant.currentStep}
                      </Badge>
                    </div>

                    <Separator />

                    {/* Tasks */}
                    {participantTasks.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Tasks ({participantTasks.length})
                        </h4>
                        {participantTasks.map((task: Task) => (
                          <Collapsible key={task.id}>
                            <CollapsibleTrigger 
                              className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80"
                              onClick={() => toggleSection(`task-${task.id}`)}
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">{task.taskType}</Badge>
                                <Badge variant="outline">{task.frictionType}</Badge>
                                <span className="font-medium">Task {task.taskId}</span>
                                {task.topic && <span className="text-sm text-muted-foreground">- {task.topic}</span>}
                              </div>
                              <ChevronDown className="w-4 h-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 space-y-3">
                              {task.topic && (
                                <div>
                                  <div className="font-medium text-sm">Topic:</div>
                                  <div className="text-sm bg-background p-2 rounded border">{task.topic}</div>
                                </div>
                              )}
                              {task.initialThoughts && (
                                <div>
                                  <div className="font-medium text-sm">Initial Thoughts:</div>
                                  <div className="text-sm bg-background p-2 rounded border">{task.initialThoughts}</div>
                                </div>
                              )}
                              {task.counterarguments && (
                                <div>
                                  <div className="font-medium text-sm">Counterarguments:</div>
                                  <div className="text-sm bg-background p-2 rounded border">{task.counterarguments}</div>
                                </div>
                              )}
                              {task.prompts && Object.keys(task.prompts).length > 0 && (
                                <Collapsible>
                                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline">
                                    <MessageSquare className="w-4 h-4" />
                                    View LLM Prompts
                                    <ChevronDown className="w-3 h-3" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-2 space-y-2">
                                    {task.prompts.systemPrompt && (
                                      <div>
                                        <div className="font-medium text-xs">System Prompt:</div>
                                        <div className="text-xs bg-blue-50 dark:bg-blue-950 p-2 rounded border">{task.prompts.systemPrompt}</div>
                                      </div>
                                    )}
                                    {task.prompts.userPrompt && (
                                      <div>
                                        <div className="font-medium text-xs">User Prompt:</div>
                                        <div className="text-xs bg-green-50 dark:bg-green-950 p-2 rounded border">{task.prompts.userPrompt}</div>
                                      </div>
                                    )}
                                  </CollapsibleContent>
                                </Collapsible>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    )}

                    {/* Questionnaire Responses */}
                    {(questionnaires.taskQuestionnaires.length > 0 || questionnaires.finalQuestionnaire) && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <ClipboardCheck className="w-4 h-4" />
                          Questionnaire Responses ({questionnaires.taskQuestionnaires.length + (questionnaires.finalQuestionnaire ? 1 : 0)})
                        </h4>
                        
                        {/* Task Questionnaires */}
                        {questionnaires.taskQuestionnaires.map((questionnaire: Questionnaire) => (
                          <Collapsible key={questionnaire.id}>
                            <CollapsibleTrigger 
                              className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80"
                              onClick={() => toggleSection(`questionnaire-${questionnaire.id}`)}
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="default">
                                  {questionnaire.taskId === 999 ? 'Final Survey' : `Task ${questionnaire.taskId} Survey`}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(questionnaire.submittedAt).toLocaleString()}
                                </span>
                              </div>
                              <ChevronDown className="w-4 h-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(formatResponses(questionnaire.responses)).map(([question, answer]) => (
                                  <div key={question} className="space-y-1">
                                    <div className="font-medium text-sm">{question}:</div>
                                    <div className="text-sm bg-background p-2 rounded border">{String(answer)}</div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              No participant data available yet. Once participants complete the study, their responses will appear here.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Database Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Quick Database Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">
            For advanced analysis, use these SQL queries to access raw data:
          </div>
          <div className="space-y-2">
            <div className="bg-muted p-2 rounded font-mono text-xs">
              <code>SELECT * FROM questionnaires ORDER BY participant_id, task_id;</code>
            </div>
            <div className="bg-muted p-2 rounded font-mono text-xs">
              <code>SELECT * FROM tasks WHERE prompts IS NOT NULL;</code>
            </div>
            <div className="bg-muted p-2 rounded font-mono text-xs">
              <code>SELECT participant_id, COUNT(*) as completed_tasks FROM tasks GROUP BY participant_id;</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}