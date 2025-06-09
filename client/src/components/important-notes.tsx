import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudyStore } from "@/lib/study-store";
import { Lightbulb, Clock, Target, Users } from "lucide-react";

export default function ImportantNotes() {
  const { setCurrentStep } = useStudyStore();

  const handleNext = () => {
    setCurrentStep("task_selection");
  };

  const handleBack = () => {
    setCurrentStep("overview");
  };

  return (
    <section className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-8">Important Notes</h1>
        </div>

        <div className="space-y-6 mb-12">
          <Card className="surface border border-border">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 surface border border-border rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Lightbulb className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-foreground">
                    Choose topics you're genuinely interested in exploring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface border border-border">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 surface border border-border rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Clock className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-foreground">
                    Take your time - quality over speed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface border border-border">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 surface border border-border rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Target className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-foreground">
                    Each task builds different skills in working with AI
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface border border-border">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 surface border border-border rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-foreground">
                    Your responses help improve AI collaboration tools
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center space-x-4">
          <Button 
            onClick={handleBack}
            variant="outline" 
            className="px-8 py-3 btn-surface"
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className="px-8 py-3 bg-primary hover:bg-primary/90"
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}