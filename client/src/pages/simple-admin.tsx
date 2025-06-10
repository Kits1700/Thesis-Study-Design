import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function SimpleAdminPage() {
  const { data: questionnaires = [], isLoading } = useQuery({
    queryKey: ['/api/admin/questionnaires'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading responses...</div>
      </div>
    );
  }

  const formatResponse = (responses: any) => {
    if (!responses || typeof responses !== 'object') return '';
    return Object.entries(responses)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const getTaskLabel = (taskId: number) => {
    if (taskId === 999) return 'Final Survey';
    return `Task ${taskId}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Responses</h1>
          <p className="text-muted-foreground">Simple table view of all participant responses</p>
        </div>
        <div className="flex gap-2">
          <Link href="/responses">
            <Button variant="outline">Detailed View</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Back to Study
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Responses ({Array.isArray(questionnaires) ? questionnaires.length : 0} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(questionnaires) && questionnaires.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant ID</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Responses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionnaires.map((q: any) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.participantId}</TableCell>
                    <TableCell>{getTaskLabel(q.taskId)}</TableCell>
                    <TableCell>{new Date(q.submittedAt).toLocaleString()}</TableCell>
                    <TableCell className="max-w-md truncate">{formatResponse(q.responses)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No responses found yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw SQL Query Helper */}
      <Card>
        <CardHeader>
          <CardTitle>Database Query</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded font-mono text-sm">
            <code>SELECT participant_id, task_id, responses, submitted_at FROM questionnaires ORDER BY submitted_at DESC;</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}