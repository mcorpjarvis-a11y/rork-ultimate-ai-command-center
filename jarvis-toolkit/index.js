import { useState, useCallback } from "react";

// A native React hook to simulate AI chat agent behavior
export const useJarvisAgent = (options = {}) => {
  const [messages, setMessages] = useState([]);

  const sendMessage = useCallback((text) => {
    console.log("JarvisAgent received:", text);
    const reply = `🤖 JARVIS reply to: ${text}`;
    setMessages((prev) => [...prev, { from: "user", text }, { from: "bot", text: reply }]);
  }, []);

  return { messages, sendMessage };
};

export const createJarvisTool = (options = {}) => {
  console.log("createJarvisTool initialized with options:", options);
  return {
    run: () => console.log("JARVIS Tool running..."),
    stop: () => console.log("JARVIS Tool stopped."),
  };
};

export const initToolkit = () => {
  console.log("JARVIS Toolkit initialized.");
};

export const getToolkitVersion = () => "1.0.0";

export default {
  useJarvisAgent,
  createJarvisTool,
  initToolkit,
  getToolkitVersion,
};
