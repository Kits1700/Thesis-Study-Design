import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useStudyStore } from "@/lib/study-store";

function LikertSlider({
  value,
  onChange,
  label,
  minLabel,
  maxLabel,
  name,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  minLabel: string;
  maxLabel: string;
  name: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-white text-base">{label}</Label>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min="1"
          max="7"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full accent-blue-500"
          name={name}
        />
        <span className="text-sm text-gray-300 w-6 text-center">{value}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function FinalQuestionnaire() {
  const { saveQuestionnaireResponse, setCurrentStep } = useStudyStore();
  const [responses, setResponses] = useState<Record<string, any>>({});

  const handleSubmit = async () => {
    console.log("Final questionnaire responses:", responses);
    saveQuestionnaireResponse(999, responses);
    setCurrentStep("completion");
  };

  const handleResponseChange = (questionKey: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  const isFormValid = () => {
    const requiredFields = [
      "deepThinking",
      "outputQuality",
      "workingRelationship",
      "aiDeceptive",
      "aiUnderhanded",
      "aiSuspicious",
      "aiHarmful",
      "aiConfident",
      "aiSecurity",
      "aiIntegrity",
      "aiDependable",
      "aiReliable",
      "aiTrustworthy",
      "uxControl",
      "uxClarity",
      "uxResponsiveness",
    ];
    return requiredFields.every((field) => responses[field]);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Final Overall Questionnaire
          </h1>
          <p className="text-gray-300">
            Please reflect on your entire experience across all four tasks.
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 space-y-8">
            {/* Section A: Comparative Judgment */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Section A: Comparative Judgment (Friction vs. No Friction)
              </h2>

              <div className="space-y-4">
                <Label className="text-white text-base">
                  1. Reflecting on all tasks, which format encouraged you to
                  think more deeply and critically about the subject matter?
                </Label>
                <RadioGroup
                  value={responses.deepThinking}
                  onValueChange={(value) =>
                    handleResponseChange("deepThinking", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no-friction" id="deep-no-friction" />
                    <Label htmlFor="deep-no-friction" className="text-gray-300">
                      The format without the extra "friction" step.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="with-friction"
                      id="deep-with-friction"
                    />
                    <Label
                      htmlFor="deep-with-friction"
                      className="text-gray-300"
                    >
                      The format with the extra "friction" step.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="equal" id="deep-equal" />
                    <Label htmlFor="deep-equal" className="text-gray-300">
                      Both formats encouraged equal depth of thought.
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-white text-base">
                  2. Which format do you believe resulted in a higher quality
                  final output?
                </Label>
                <RadioGroup
                  value={responses.outputQuality}
                  onValueChange={(value) =>
                    handleResponseChange("outputQuality", value)
                  }
                >
                  {[
                    {
                      value: "no-friction-much-better",
                      label: "The format without friction was much better.",
                    },
                    {
                      value: "no-friction-slightly-better",
                      label: "The format without friction was slightly better.",
                    },
                    {
                      value: "similar",
                      label: "Both formats produced similar quality outputs.",
                    },
                    {
                      value: "friction-slightly-better",
                      label: "The format with friction was slightly better.",
                    },
                    {
                      value: "friction-much-better",
                      label: "The format with friction was much better.",
                    },
                  ].map((opt) => (
                    <div
                      className="flex items-center space-x-2"
                      key={opt.value}
                    >
                      <RadioGroupItem value={opt.value} id={opt.value} />
                      <Label htmlFor={opt.value} className="text-gray-300">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Section B: Trust & Distrust */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Section B: Overall Trust & Distrust in the AI
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                The following questions ask for your overall impression of the
                AI you interacted with across all tasks. (Scale: 1 = Not at all,
                7 = Extremely)
              </p>

              <h3 className="text-lg font-medium text-white">
                Distrust Subscale
              </h3>
              {[
                { key: "aiDeceptive", text: "3. The AI is deceptive." },
                {
                  key: "aiUnderhanded",
                  text: "4. The AI behaves in an underhanded manner.",
                },
                {
                  key: "aiSuspicious",
                  text: "5. I am suspicious of the AI's intent, action, or outputs.",
                },
                {
                  key: "aiHarmful",
                  text: "6. The AI's actions will have a harmful or injurious outcome.",
                },
              ].map((item) => (
                <LikertSlider
                  key={item.key}
                  name={item.key}
                  value={responses[item.key] || "4"}
                  onChange={(value) => handleResponseChange(item.key, value)}
                  label={item.text}
                  minLabel="Not at all"
                  maxLabel="Extremely"
                />
              ))}

              <h3 className="text-lg font-medium text-white mt-8">
                Trust Subscale
              </h3>
              {[
                { key: "aiConfident", text: "7. I am confident in the AI." },
                { key: "aiSecurity", text: "8. The AI provides security." },
                { key: "aiIntegrity", text: "9. The AI has integrity." },
                { key: "aiDependable", text: "10. The AI is dependable." },
                { key: "aiReliable", text: "11. The AI is reliable." },
                { key: "aiTrustworthy", text: "12. I can trust the AI." },
              ].map((item) => (
                <LikertSlider
                  key={item.key}
                  name={item.key}
                  value={responses[item.key] || "4"}
                  onChange={(value) => handleResponseChange(item.key, value)}
                  label={item.text}
                  minLabel="Not at all"
                  maxLabel="Extremely"
                />
              ))}
            </div>

            {/* Section C: Final Reflections */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Section C: Final Reflections & Behavioral Intent
              </h2>

              <LikertSlider
                name="workingRelationship"
                value={responses.workingRelationship || "4"}
                onChange={(value) =>
                  handleResponseChange("workingRelationship", value)
                }
                label="13. Overall, how would you describe your final working relationship with the AI across the tasks?"
                minLabel="Passively accepted"
                maxLabel="Actively collaborated"
              />

              <div className="space-y-4">
                <Label className="text-white text-base">
                  14. Please briefly describe any final thoughts on how the
                  "friction" steps changed your relationship with or reliance on
                  the AI, if at all.
                </Label>
                <Textarea
                  value={responses.finalThoughts || ""}
                  onChange={(e) =>
                    handleResponseChange("finalThoughts", e.target.value)
                  }
                  placeholder="Share your reflections on the friction steps and their impact on your AI interaction..."
                  className="bg-gray-700 border-gray-600 text-white min-h-24"
                />
              </div>
            </div>

            {/* Section D: UX Reflections */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Section D: User Experience Across All Tasks
              </h2>

              <p className="text-gray-300 text-sm mb-4">
                Please reflect on how it felt to interact with the system
                interface throughout the entire study. (Scale: 1 = Strongly
                disagree, 7 = Strongly agree)
              </p>

              {[
                {
                  key: "uxControl",
                  text: "15. I felt in control while using the system.",
                },
                {
                  key: "uxClarity",
                  text: "16. The interface was well organized and clear.",
                },
                {
                  key: "uxResponsiveness",
                  text: "17. The system responded quickly to my actions.",
                },
              ].map((item) => (
                <LikertSlider
                  key={item.key}
                  name={item.key}
                  value={responses[item.key] || "4"}
                  onChange={(value) => handleResponseChange(item.key, value)}
                  label={item.text}
                  minLabel="Strongly disagree"
                  maxLabel="Strongly agree"
                />
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                disabled={!isFormValid()}
              >
                Submit Final Questionnaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
