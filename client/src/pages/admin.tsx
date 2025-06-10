import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Database, Users, ClipboardCheck, Brain } from "lucide-react";
import { Link } from "wouter";

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

  const participantCount = Array.isArray(participants) ? participants.length : 0;
  const taskCount = Array.isArray(tasks) ? tasks.length : 0;
  const questionnaireCount = Array.isArray(questionnaires) ? questionnaires.length : 0;

  if (participantsLoading || tasksLoading || questionnairesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

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

      {/* Database Access Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Direct Database Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            All participant responses are permanently stored in the PostgreSQL database. You can access the raw data using these queries:
          </p>
          
          <div className="space-y-3">
            <div className="bg-muted p-3 rounded font-mono text-sm">
              <div className="font-semibold mb-1">View all participants:</div>
              <code>SELECT * FROM participants;</code>
            </div>
            
            <div className="bg-muted p-3 rounded font-mono text-sm">
              <div className="font-semibold mb-1">View all task responses:</div>
              <code>SELECT * FROM tasks;</code>
            </div>
            
            <div className="bg-muted p-3 rounded font-mono text-sm">
              <div className="font-semibold mb-1">View all questionnaire responses:</div>
              <code>SELECT * FROM questionnaires;</code>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded border">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Current Status</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {participantCount === 0 ? 
                "No participants have started the study yet. Once participants begin, their data will appear here automatically." :
                `${participantCount} participant(s) have started the study with ${taskCount} task(s) completed and ${questionnaireCount} questionnaire(s) submitted.`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Export Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Participants Table:</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><code>participant_id</code> - Unique identifier</li>
                <li><code>start_time</code> - When they began the study</li>
                <li><code>completed_at</code> - When they finished (null if ongoing)</li>
                <li><code>current_step</code> - Current position in study</li>
                <li><code>study_data</code> - JSON with task selections and progress</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tasks Table:</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><code>task_type</code> - "literature-review" or "argument-exploration"</li>
                <li><code>friction_type</code> - "low", "medium", or "high"</li>
                <li><code>topic</code> - User-entered research topic</li>
                <li><code>initial_thoughts</code> - User's preliminary ideas</li>
                <li><code>counterarguments</code> - User's opposing viewpoints</li>
                <li><code>generated_content</code> - JSON with LLM responses</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Questionnaires Table:</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><code>task_id</code> - Associated task (999 for final questionnaire)</li>
                <li><code>responses</code> - JSON with all survey answers</li>
                <li><code>submitted_at</code> - Timestamp of submission</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}