interface ToastStackProps {
  messages: Array<{ id: string; text: string; error?: boolean }>;
}

export function ToastStack({ messages }: ToastStackProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="toast-stack no-print" aria-live="polite">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`toast${message.error ? ' error' : ''}`}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
}
