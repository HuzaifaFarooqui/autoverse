import { useState } from "react";

interface Props {
  code: string;
  language?: string;
}

export default function CodeSnippet({ code, language = "text" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <button
        className={`copy-btn ${copied ? "copied" : ""}`}
        onClick={handleCopy}
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
