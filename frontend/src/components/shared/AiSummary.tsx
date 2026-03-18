interface AiSummaryProps {
  text: string;
  show: boolean;
}

export default function AiSummary({ text, show }: AiSummaryProps) {
  if (!show) return null;

  return (
    <div className="ai-insight">
      <p>{text}</p>
    </div>
  );
}
