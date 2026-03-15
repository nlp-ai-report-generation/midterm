const AI_MODEL = "Claude Opus 4.6";

interface AiSummaryProps {
  text: string;
  show: boolean;
}

export default function AiSummary({ text, show }: AiSummaryProps) {
  if (!show) return null;

  return (
    <div className="ai-insight">
      <p>{text}</p>
      <p className="ai-insight-source">Powered by {AI_MODEL}</p>
    </div>
  );
}
