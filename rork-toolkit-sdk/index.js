import { useState, useCallback } from "react";

// A fake React hook to simulate AI chat agent behavior
export const useRorkAgent = (options = {}) => {
  const [messages, setMessages] = useState([]);

  const sendMessage = useCallback((text) => {
    console.log("RorkAgent received:", text);
    const reply = `🤖 RorkAgent reply to: ${text}`;
    setMessages((prev) => [...prev, { from: "user", text }, { from: "bot", text: reply }]);
  }, []);

  return { messages, sendMessage };
};

export const createRorkTool = (options = {}) => {
  console.log("createRorkTool initialized with options:", options);
  return {
    run: () => console.log("Rork Tool running..."),
    stop: () => console.log("Rork Tool stopped."),
  };
};

export const initToolkit = () => {
  console.log("Toolkit initialized.");
};

export const getToolkitVersion = () => "1.0.0";

export default {
  useRorkAgent,
  createRorkTool,
  initToolkit,
  getToolkitVersion,
};
