import React, { useState } from "react";
import { useStudyStore } from "@/lib/study-store";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export default function Questionnaire() {
  const {
    currentTask,
    setCurrentStep,
    completedTasks,
    saveQuestionnaireResponse,
  } = useStudyStore();

  const showFrictionQuestions = currentTask?.id === 3 || currentTask?.id === 4;

  const scaleDescriptions: Record<string, { low: string; high: string }> = {
    mental_demand: { low: "Very Low", high: "Very High" },
    usefulness: { low: "Not at all useful", high: "Extremely useful" },
    satisfaction: { low: "Very Unsatisfied", high: "Very Satisfied" },
    critical_evaluation: {
      low: "Did not evaluate critically",
      high: "Evaluated very critically",
    },
    reliance: {
      low: "Relied entirely on own ideas",
      high: "Relied entirely on AI's output",
    },
    dependable: { low: "Not at all", high: "Extremely" },
    confidence: { low: "Not at all", high: "Extremely" },
    integrity: { low: "Not at all", high: "Extremely" },
    reliable: { low: "Not at all", high: "Extremely" },
    trust: { low: "Not at all", high: "Extremely" },

    ux_control: { low: "Strongly disagree", high: "Strongly agree" },
    ux_clarity: { low: "Strongly disagree", high: "Strongly agree" },
    ux_responsiveness: { low: "Strongly disagree", high: "Strongly agree" },
  };

  const questionSections = [
    {
      title: "Section A: Task Workload (NASA-TLX)",
      scale: "1 = Very Low, 7 = Very High",
      items: [
        {
          id: "mental_demand",
          text: "1. How mentally demanding was the task?",
          tooltip:
            "How much mental and perceptual activity was required? Was the task easy or demanding, simple or complex?",
        },
        {
          id: "physical_demand",
          text: "2. How physically demanding was the task?",
          tooltip:
            "How much physical activity was required? Was the task easy or demanding, slack or strenuous?",
        },
        {
          id: "temporal_demand",
          text: "3. How hurried or rushed was the pace of the task?",
          tooltip:
            "How much time pressure did you feel due to the pace at which the tasks or task elements occurred?",
        },
        {
          id: "performance",
          text: "4. How successful were you in accomplishing what you were asked to do?",
          tooltip:
            "How successful do you think you were in accomplishing the goals of the task set by the experimenter?",
        },
        {
          id: "effort",
          text: "5. How hard did you have to work to accomplish your level of performance?",
          tooltip:
            "How hard did you have to work (mentally and physically) to accomplish your level of performance?",
        },
        {
          id: "frustration",
          text: "6. How insecure, discouraged, irritated, stressed, and annoyed were you?",
          tooltip:
            "How insecure, discouraged, irritated, stressed and annoyed versus secure, gratified, content, relaxed and complacent did you feel during the task?",
        },
      ],
    },
    {
      title: "Section B: Task Usefulness & Satisfaction",
      scale:
        "1 = Not at all useful/Very Unsatisfied, 7 = Extremely useful/Very Satisfied",
      items: [
        {
          id: "usefulness",
          text: "7. How useful was the AI-generated output for accomplishing your task goal?",
          tooltip:
            "Rate how helpful the AI's response was for completing your assigned task",
        },
        {
          id: "satisfaction",
          text: "8. How satisfied are you with the quality of the final output you created?",
          tooltip:
            "Rate your overall satisfaction with the final result you produced",
        },
      ],
    },
    {
      title: "Section C: Reliance & Critical Engagement",
      scale:
        "1 = Not at all/Relied entirely on own ideas, 7 = Very critically/Relied entirely on AI's output",
      items: [
        {
          id: "critical_evaluation",
          text: "9. To what extent did you critically evaluate the AI's response instead of accepting it as correct?",
          tooltip:
            "How much did you question, analyze, or verify the AI's output rather than accepting it at face value?",
        },
        {
          id: "reliance",
          text: "10. Please rate your reliance on the AI's output for this task.",
          tooltip:
            "How much did you depend on the AI's response versus your own knowledge and ideas?",
        },
      ],
    },
    {
      title: "Section D: Perceived AI Trustworthiness",
      scale: "1 = Strongly Disagree, 7 = Strongly Agree",
      items: [
        {
          id: "dependable",
          text: "11. The AI is dependable.",
          tooltip: "The AI performs consistently and reliably",
        },
        {
          id: "confident",
          text: "12. I am confident in the AI.",
          tooltip: "You feel assured about the AI's capabilities",
        },
        {
          id: "integrity",
          text: "13. The AI has integrity.",
          tooltip: "The AI is honest and operates with good intentions",
        },
        {
          id: "reliable",
          text: "14. The AI is reliable.",
          tooltip: "The AI produces consistent and accurate results",
        },
      ],
    },
  ];

  const frictionQuestions = [
    {
      id: "friction_thoughtful_engagement",
      text:
        currentTask?.taskType === "literature_review"
          ? "15. How did completing the preparatory task (ranking abstracts) before accessing the AI's response affect your level of thoughtful engagement with the task?"
          : "15. How did completing the preparatory task (formulating a counterargument) before accessing the AI's response affect your level of thoughtful engagement with the task?",
      scale:
        "1 = It felt like an unnecessary barrier, 7 = It significantly encouraged reflective thinking",
      tooltip:
        "Consider whether the preparatory step enhanced your thoughtful engagement with the overall task",
    },
    {
      id: "friction_scrutiny_influence",
      text:
        currentTask?.taskType === "literature_review"
          ? "16. To what extent did the preparatory task (ranking abstracts) influence your scrutiny of the AI-generated output?"
          : "16. To what extent did the preparatory task (formulating a counterargument) influence your scrutiny of the AI-generated output?",
      scale:
        "1 = No influence on my scrutiny, 7 = Greatly increased my scrutiny of the AI output",
      tooltip:
        "Reflect on whether the preparatory work changed how critically you examined the AI's response",
    },
    {
      id: "friction_reasoning_confidence",
      text:
        currentTask?.taskType === "literature_review"
          ? "17. How did the preparatory task (ranking abstracts) influence your confidence in relying on your own reasoning versus the AI's output?"
          : "17. How did the preparatory task (formulating a counterargument) influence your confidence in relying on your own reasoning versus the AI's output?",
      scale:
        "1 = No influence, I relied entirely on the AI, 7 = Greatly increased my confidence in my own reasoning over the AI's output",
      tooltip:
        "Consider whether the preparatory step affected your trust in your own judgment versus the AI's recommendations",
    },
  ];

  const uxQuestions = [
    {
      id: "ux_control",
      text: "18. I felt in control while using the system.",
      tooltip:
        "You felt you had agency and could direct the interaction effectively",
    },
    {
      id: "ux_clarity",
      text: "19. The interface was well organized and clear.",
      tooltip: "The layout and design were easy to understand and navigate",
    },
    {
      id: "ux_responsiveness",
      text: "20. The system responded quickly to my actions.",
      tooltip:
        "The system provided timely feedback and responses to your inputs",
    },
  ];

  const [responses, setResponses] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    questionSections.forEach((section) => {
      section.items.forEach((item) => {
        initial[item.id] = 4; // default middle value
      });
    });
    // Add friction questions if applicable
    if (showFrictionQuestions) {
      frictionQuestions.forEach((item) => {
        initial[item.id] = 4;
      });
    }
    // Add UX questions
    uxQuestions.forEach((item) => {
      initial[item.id] = 4;
    });
    return initial;
  });

  const handleChange = (id: string, value: number) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    console.log("Submitted questionnaire responses:", responses);

    if (currentTask?.id) {
      saveQuestionnaireResponse(currentTask.id, responses);

      const totalCompleted = new Set([
        ...completedTasks.map((t) => t.taskId),
        currentTask.id,
      ]).size;

      if (totalCompleted >= 4) {
        if (completedTasks.length >= 4) {
          setCurrentStep("final_questionnaire");
        } else {
          setCurrentStep("task_selection");
        }
      } else {
        setCurrentStep("task_selection");
      }
    }
  };

  return (
    <TooltipProvider>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-white mb-6">
          Post-Task Questionnaire
        </h1>

        {questionSections.map((section) => (
          <div key={section.title} className="mb-10">
            <h2 className="text-xl font-semibold text-gray-200 mb-3">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-sm text-gray-400 italic mb-2">
                {section.subtitle}
              </p>
            )}
            {section.scale && (
              <p className="text-sm text-gray-400 mb-3">({section.scale})</p>
            )}
            <div className="space-y-6">
              {section.items.map((q) => (
                <Card key={q.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor={q.id} className="text-white">
                        {q.text}
                      </Label>
                      {q.tooltip && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{q.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400 px-1 select-none">
                        <span>1 = {scaleDescriptions[q.id]?.low || "Low"}</span>
                        <span className="text-gray-300 font-medium">
                          4 = Neutral
                        </span>
                        <span>
                          7 = {scaleDescriptions[q.id]?.high || "High"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                          <Slider
                            id={q.id}
                            name={q.id}
                            min={1}
                            max={7}
                            step={1}
                            value={[responses[q.id]]}
                            onValueChange={(val) => handleChange(q.id, val[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span className="font-bold text-gray-300">4</span>
                            <span>5</span>
                            <span>6</span>
                            <span>7</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-300 w-8 text-center font-medium bg-gray-700 px-2 py-1 rounded">
                          {responses[q.id]}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Friction-specific questions for tasks 3 and 4 */}
        {showFrictionQuestions && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Section E: Reflection on Extra Step
              </h3>
              <p className="text-sm text-gray-400">Only for "friction" tasks</p>
            </div>
            <div className="space-y-4">
              {frictionQuestions.map((q) => (
                <Card key={q.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor={q.id} className="text-white">
                        {q.text}
                      </Label>
                      {q.tooltip && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{q.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">({q.scale})</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400 px-1 select-none">
                        <span>1</span>
                        <span className="text-gray-300 font-medium">
                          4 = Neutral
                        </span>
                        <span>7</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                          <Slider
                            id={q.id}
                            name={q.id}
                            min={1}
                            max={7}
                            step={1}
                            value={[responses[q.id] || 4]}
                            onValueChange={(val) => handleChange(q.id, val[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span className="font-bold text-gray-300">4</span>
                            <span>5</span>
                            <span>6</span>
                            <span>7</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-300 w-8 text-center font-medium bg-gray-700 px-2 py-1 rounded">
                          {responses[q.id] || 4}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Section F: User Experience */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Section F: User Experience
            </h3>
            <p className="text-sm text-gray-400">
              (1 = Strongly Disagree, 7 = Strongly Agree)
            </p>
          </div>
          <div className="space-y-4">
            {uxQuestions.map((q) => (
              <Card key={q.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor={q.id} className="text-white">
                      {q.text}
                    </Label>
                    {q.tooltip && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{q.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 px-1 select-none">
                      <span>1 = Strongly Disagree</span>
                      <span className="text-gray-300 font-medium">
                        4 = Neutral
                      </span>
                      <span>7 = Strongly Agree</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 relative">
                        <Slider
                          id={q.id}
                          name={q.id}
                          min={1}
                          max={7}
                          step={1}
                          value={[responses[q.id] || 4]}
                          onValueChange={(val) => handleChange(q.id, val[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span className="font-bold text-gray-300">4</span>
                          <span>5</span>
                          <span>6</span>
                          <span>7</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-300 w-8 text-center font-medium bg-gray-700 px-2 py-1 rounded">
                        {responses[q.id] || 4}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={handleSubmit} className="px-8 py-3">
            Submit
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
