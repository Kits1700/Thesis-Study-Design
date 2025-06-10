import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HelpCircle, X, Lightbulb, BookOpen, Target, MessageCircle, Sparkles } from "lucide-react";
import { useStudyStore } from "@/lib/study-store";

interface HelpTooltipProps {
  className?: string;
}

export default function HelpTooltip({ className }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentStep, currentTask } = useStudyStore();

  const getContextualHelp = () => {
    switch (currentStep) {
      case "overview":
        return {
          title: "Welcome to the Study! 👋",
          content: "This research explores how different AI assistance approaches affect your thinking process. You'll complete 4 tasks comparing immediate AI help vs. preparatory work first.",
          tips: [
            "Take your time to read through the instructions",
            "There are no right or wrong answers",
            "Your honest feedback is valuable for research"
          ]
        };

      case "important_notes":
        return {
          title: "Study Guidelines 📋",
          content: "These guidelines ensure fair comparison between different AI assistance methods.",
          tips: [
            "Follow the task sequence: 1 → 2 → 3 → 4",
            "Complete questionnaires honestly after each task",
            "Notice the differences between task types"
          ]
        };

      case "task_selection":
        return {
          title: "Task Selection 🎯",
          content: "Complete tasks sequentially. Tasks 1&2 are Summative (Literature Review), Tasks 3&4 are Generative (Argument Exploration).",
          tips: [
            "Tasks unlock one by one as you complete them",
            "Compare different task types and assistance levels",
            "Each task takes about 10-15 minutes"
          ]
        };

      case "literature_review":
        return {
          title: "Literature Review - Summative Task 📚",
          content: currentTask?.frictionType === "full_ai" 
            ? "You have immediate access to AI assistance. Use it freely to help generate a comprehensive literature review."
            : "Complete your preparatory work first, then access AI assistance to enhance your review.",
          tips: currentTask?.frictionType === "full_ai" 
            ? [
                "Enter your topic and click 'Generate Review'",
                "The AI will provide structured academic content",
                "Feel free to regenerate with different topics"
              ]
            : [
                "Find and rank 5-7 paper abstracts first",
                "AI assistance unlocks after completing preparatory work",
                "Compare this approach with the previous task"
              ]
        };

      case "argument_exploration":
        return {
          title: "Argument Exploration - Generative Task 💭",
          content: currentTask?.frictionType === "full_ai"
            ? "You have immediate access to AI assistance for exploring complex arguments on your chosen topic."
            : "Complete your own brainstorming first, then unlock AI assistance to enhance your ideas.",
          tips: currentTask?.frictionType === "full_ai"
            ? [
                "Enter your topic and use AI to develop arguments",
                "The AI will help structure comprehensive perspectives",
                "Feel free to explore different angles"
              ]
            : [
                "Start by writing your initial thoughts",
                "Add counterarguments from your perspective", 
                "AI assistance unlocks after completing preparatory work"
              ]
        };

      case "questionnaire":
        return {
          title: "Task Reflection 📝",
          content: "Share your experience with this task. Your feedback helps us understand AI assistance effectiveness.",
          tips: [
            "Rate your engagement honestly",
            "Consider how the AI assistance felt",
            "Think about your learning experience"
          ]
        };

      case "completion":
        return {
          title: "Study Complete! 🎉",
          content: "Thank you for participating! Your responses contribute to understanding AI-human collaboration in academic work.",
          tips: [
            "Complete the final comparative questionnaire",
            "Reflect on the differences between task types",
            "Your insights are valuable for research"
          ]
        };

      default:
        return {
          title: "AI Study Assistant 🤖",
          content: "I'm here to help guide you through this research study about AI assistance approaches.",
          tips: [
            "Click me anytime for contextual help",
            "I provide different guidance for each step",
            "Focus on your authentic experience"
          ]
        };
    }

    return {
      title: "AI Study Assistant 🤖",
      content: "I'm here to help guide you through this research study.",
      tips: ["Click me anytime for help and guidance"]
    };
  };

  const helpContent = getContextualHelp();

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-purple-400"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="left" 
          align="end"
          className="w-80 bg-gray-800 border-gray-600 text-white shadow-xl"
        >
          <Card className="bg-transparent border-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  {helpContent.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {helpContent.content}
              </p>
              
              {helpContent.tips && helpContent.tips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-purple-300 flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Quick Tips:
                  </h4>
                  <ul className="space-y-1">
                    {helpContent.tips.map((tip, index) => (
                      <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-gray-600 space-y-3">
                <div className="flex gap-2">
                  {currentStep === "task_selection" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="text-xs bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300"
                    >
                      Got it!
                    </Button>
                  )}
                  {(currentStep === "literature_review" || currentStep === "argument_exploration") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="text-xs bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300"
                    >
                      Let's start
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-400 italic flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  I update based on where you are in the study
                </p>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}