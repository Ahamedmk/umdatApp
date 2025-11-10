import React, { useState } from 'react';
import QuizMCQ from '../components/QuizMCQ';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Quiz() {
  const demo = {
    question: "Dans le hadith 10, que signifient الغُرّة والتحجيل ?",
    options: [
      "Des invocations particulières",
      "Des marques lumineuses dues au wuḍūʾ",
      "Des ablutions sèches",
      "Des vêtements de prière"
    ],
    correctIndex: 1
  };
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const submit = () => {
    if (selected==null) return;
    const ok = selected === demo.correctIndex;
    setScore(s=> s + (ok?1:0));
    setDone(true);
  };

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
          <CardDescription>Teste ta compréhension des hadiths.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-medium">{demo.question}</h3>
          <div className="grid gap-2">
            {demo.options.map((opt,i)=> (
              <Button key={i} variant={selected===i? 'default':'outline'} disabled={done} onClick={()=>setSelected(i)} className="justify-start">
                {opt}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={submit} disabled={done || selected==null}>Valider</Button>
            {done && <span className="text-sm">{selected===demo.correctIndex ? '✅ Bonne réponse' : '❌ Mauvaise réponse'}</span>}
          </div>
          <div className="text-sm text-muted-foreground">Score: {score}</div>
        </CardContent>
      </Card>
    </section>
  );
}

