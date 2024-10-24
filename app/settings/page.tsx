"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function Settings() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [fewShotExamples, setFewShotExamples] = useState([
    { poor_ask: "", better_ask: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [promptResponse, examplesResponse] = await Promise.all([
        fetch("http://localhost:8000/get-system-prompt"),
        fetch("http://localhost:8000/get-few-shot-examples"),
      ]);
      const promptData = await promptResponse.json();
      const examplesData = await examplesResponse.json();
      setSystemPrompt(promptData.system_prompt);
      setFewShotExamples(examplesData.few_shot_examples);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await Promise.all([
        fetch("http://localhost:8000/update-system-prompt", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_prompt: systemPrompt }),
        }),
        fetch("http://localhost:8000/update-few-shot-examples", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examples: fewShotExamples }),
        }),
      ]);
      toast({
        title: "Settings Updated",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await fetch("http://localhost:8000/reset-defaults", { method: "POST" });
      await fetchSettings();
      toast({
        title: "Settings Reset",
        description: "Your settings have been reset to defaults.",
      });
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Customize the ASK Evaluator</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label>Few-Shot Examples</Label>
                {fewShotExamples.map((example, index) => (
                  <div key={index} className="grid gap-2">
                    <Input
                      placeholder="Poor Ask"
                      value={example.poor_ask}
                      onChange={(e) => {
                        const newExamples = [...fewShotExamples];
                        newExamples[index].poor_ask = e.target.value;
                        setFewShotExamples(newExamples);
                      }}
                    />
                    <Input
                      placeholder="Better Ask"
                      value={example.better_ask}
                      onChange={(e) => {
                        const newExamples = [...fewShotExamples];
                        newExamples[index].better_ask = e.target.value;
                        setFewShotExamples(newExamples);
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFewShotExamples([
                      ...fewShotExamples,
                      { poor_ask: "", better_ask: "" },
                    ])
                  }
                >
                  Add Example
                </Button>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Settings"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset to Defaults
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
