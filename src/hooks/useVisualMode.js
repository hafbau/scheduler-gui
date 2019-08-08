import { useState } from "react";

export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);
  
  function transition(mode, replace) {
    setMode(mode);
    setHistory(prev => 
      (
        replace
        ? [...prev.slice(0, prev.length - 1), mode]
        : [...prev, mode]
      )
    );
  }

  function back() {
    if (history.length < 2) return;
    setMode(history[history.length - 2]);
    setHistory(prev => ([...prev.slice(0, history.length - 1)]));
  }

  return { mode, transition, back };
}