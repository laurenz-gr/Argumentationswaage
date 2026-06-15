import { useEffect, useState } from 'react';

let pushToastImpl: ((text: string, error?: boolean) => void) | null = null;

export function useToast() {
  const [messages, setMessages] = useState<
    Array<{ id: string; text: string; error?: boolean }>
  >([]);

  useEffect(() => {
    pushToastImpl = (text, error = false) => {
      const id = crypto.randomUUID();
      setMessages((current) => [...current, { id, text, error }]);
      window.setTimeout(() => {
        setMessages((current) => current.filter((message) => message.id !== id));
      }, 2800);
    };

    return () => {
      pushToastImpl = null;
    };
  }, []);

  const pushToast = (text: string, error = false) => {
    pushToastImpl?.(text, error);
  };

  return { messages, pushToast };
}

export function pushToast(text: string, error = false) {
  pushToastImpl?.(text, error);
}
