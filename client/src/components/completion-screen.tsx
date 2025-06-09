import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudyStore } from "@/lib/study-store";
import { CheckCircle, Download } from "lucide-react";

export default function CompletionScreen() {
  const { participantId, completedTasks, setCurrentStep } = useStudyStore();

  const downloadDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/export/${participantId}`);
      if (!response.ok) throw new Error("Failed to export data");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `study_data_${participantId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });

  const handleDownloadData = () => {
    downloadDataMutation.mutate();
  };

  const handleReturnToMenu = () => {
    setCurrentStep("overview");
  };

  return (
    <section className="py-12 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-black" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Study Completed Successfully</h1>
          <p className="text-secondary text-lg">
            Thank you for your participation in this research study. Your responses have been recorded and will contribute to our understanding of AI assistance in academic tasks.
          </p>
        </div>

        <Card className="surface border border-border mb-8">
          <CardHeader>
            <CardTitle>Study Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-secondary mb-1">Tasks Completed</p>
                <p className="font-semibold">{completedTasks.length} of 4</p>
              </div>
              <div>
                <p className="text-secondary mb-1">Participant ID</p>
                <p className="font-semibold font-mono">{participantId}</p>
              </div>
              <div>
                <p className="text-secondary mb-1">Condition A</p>
                <p className="font-semibold">Full AI Assistance</p>
              </div>
              <div>
                <p className="text-secondary mb-1">Condition B</p>
                <p className="font-semibold">Selective Friction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button 
            onClick={handleDownloadData}
            disabled={downloadDataMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadDataMutation.isPending ? "Downloading..." : "Download Study Data"}
          </Button>
          <Button 
            onClick={handleReturnToMenu}
            variant="outline" 
            className="w-full btn-surface"
          >
            Return to Main Menu
          </Button>
        </div>
      </div>
    </section>
  );
}
