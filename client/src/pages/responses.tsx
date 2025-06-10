import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ClipboardCheck } from "lucide-react";
import { Link } from "wouter";

interface Questionnaire {
  id: number;
  participantId: string;
  taskId: number;
  responses: any;
  submittedAt: string;
}

export default function ResponsesPage() {
  const { data: questionnaires = [], isLoading } = useQuery({
    queryKey: ['/api/admin/questionnaires'],
  });

  const formatResponses = (responses: any) => {
    if (!responses || typeof responses !== 'object') return [];
    return Object.entries(responses).map(([key, value]) => ({
      question: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      answer: String(value)
    }));
  };

  const groupByParticipant = (questionnaires: any[]) => {
    const grouped = questionnaires.reduce((acc, q) => {
      if (!acc[q.participantId]) {
        acc[q.participantId] = [];
      }
      acc[q.participantId].push(q);
      return acc;
    }, {} as Record<string, Questionnaire[]>);

    // Sort each participant's questionnaires by task ID
    Object.keys(grouped).forEach(participantId => {
      grouped[participantId].sort((a: Questionnaire, b: Questionnaire) => a.taskId - b.taskId);
    });

    return grouped;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading responses...</div>
      </div>
    );
  }

  const validQuestionnaires = Array.isArray(questionnaires) ? questionnaires : [];
  const groupedQuestionnaires = groupByParticipant(validQuestionnaires);
  const participantIds = Object.keys(groupedQuestionnaires);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Responses</h1>
          <p className="text-muted-foreground">All participant questionnaire responses</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin">
            <Button variant="outline">Admin Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Back to Study
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Response Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{participantIds.length}</div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{validQuestionnaires.length}</div>
              <div className="text-sm text-muted-foreground">Total Responses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {validQuestionnaires.filter((q: any) => q.taskId === 999).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed Studies</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participant Responses */}
      {participantIds.length > 0 ? (
        <div className="space-y-6">
          {participantIds.map(participantId => {
            const participantQuestionnaires = groupedQuestionnaires[participantId];
            return (
              <Card key={participantId}>
                <CardHeader>
                  <CardTitle>Participant {participantId}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {participantQuestionnaires.length} responses
                    </Badge>
                    {participantQuestionnaires.some((q: Questionnaire) => q.taskId === 999) && (
                      <Badge variant="default">Study Completed</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {participantQuestionnaires.map(questionnaire => (
                      <div key={questionnaire.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">
                            {questionnaire.taskId === 999 
                              ? 'Final Survey' 
                              : `Task ${questionnaire.taskId} Survey`
                            }
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(questionnaire.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {formatResponses(questionnaire.responses).map(({ question, answer }, index) => (
                            <div key={index} className="bg-muted p-3 rounded">
                              <div className="font-medium text-sm mb-1">{question}</div>
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {answer}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              No responses found. Once participants complete questionnaires, their responses will appear here.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}