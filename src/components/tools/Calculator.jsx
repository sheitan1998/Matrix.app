import React, { useState } from "react";
import { X } from "lucide-react";

export default function Calculator({ onClose }) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [waiting, setWaiting] = useState(false);

  const inputNum = (n) => {
    if (waiting) { setDisplay(n); setWaiting(false); }
    else setDisplay(display === "0" ? n : display + n);
  };

  const inputDot = () => {
    if (waiting) { setDisplay("0."); setWaiting(false); }
    else if (!display.includes(".")) setDisplay(display + ".");
  };

  const clear = () => { setDisplay("0"); setPrev(null); setOp(null); setWaiting(false); };

  const compute = (a, b, o) => {
    switch (o) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleOp = (nextOp) => {
    const current = parseFloat(display);
    if (prev !== null && op && !waiting) {
      const result = compute(prev, current, op);
      setPrev(result);
      setDisplay(String(result));
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setWaiting(true);
  };

  const equals = () => {
    if (op === null || prev === null) return;
    const current = parseFloat(display);
    const result = compute(prev, current, op);
    setDisplay(String(result));
    setPrev(null); setOp(null); setWaiting(true);
  };

  const negate = () => setDisplay(String(parseFloat(display) * -1));
  const percent = () => setDisplay(String(parseFloat(display) / 100));

  const sciOp = (fn) => {
    const v = parseFloat(display);
    let r;
    switch (fn) {
      case "√": r = Math.sqrt(v); break;
      case "x²": r = v * v; break;
      case "sin": r = Math.sin(v * Math.PI / 180); break;
      case "cos": r = Math.cos(v * Math.PI / 180); break;
      case "tan": r = Math.tan(v * Math.PI / 180); break;
      case "π": r = Math.PI; break;
      default: r = v;
    }
    setDisplay(String(+r.toFixed(8)));
    setWaiting(true);
  };

  const Btn = ({ label, onClick, variant = "num" }) => (
    <button onClick={onClick}
      className={`h-12 rounded-xl text-sm font-bold transition active:scale-95 ${variant === "op" ? "text-white" : variant === "fn" ? "text-white/70" : "text-white"}`}
      style={{
        background: variant === "op" ? "rgba(255,77,77,0.15)" : variant === "fn" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
      {label}
    </button>
  );

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-white">Calculatrice</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Display */}
      <div className="mb-4 p-4 rounded-xl text-right overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[10px] text-white/30 h-3 truncate">{prev !== null ? `${prev} ${op || ""}` : ""}</div>
        <div className="text-3xl font-mono font-black text-white truncate">{display}</div>
      </div>

      {/* Scientific row */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        <Btn label="√" variant="fn" onClick={() => sciOp("√")} />
        <Btn label="x²" variant="fn" onClick={() => sciOp("x²")} />
        <Btn label="sin" variant="fn" onClick={() => sciOp("sin")} />
        <Btn label="cos" variant="fn" onClick={() => sciOp("cos")} />
      </div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        <Btn label="tan" variant="fn" onClick={() => sciOp("tan")} />
        <Btn label="π" variant="fn" onClick={() => sciOp("π")} />
        <Btn label="%" variant="fn" onClick={percent} />
        <Btn label="±" variant="fn" onClick={negate} />
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-4 gap-2">
        <Btn label="C" variant="op" onClick={clear} />
        <Btn label="÷" variant="op" onClick={() => handleOp("÷")} />
        <Btn label="×" variant="op" onClick={() => handleOp("×")} />
        <Btn label="−" variant="op" onClick={() => handleOp("−")} />

        <Btn label="7" onClick={() => inputNum("7")} />
        <Btn label="8" onClick={() => inputNum("8")} />
        <Btn label="9" onClick={() => inputNum("9")} />
        <Btn label="+" variant="op" onClick={() => handleOp("+")} />

        <Btn label="4" onClick={() => inputNum("4")} />
        <Btn label="5" onClick={() => inputNum("5")} />
        <Btn label="6" onClick={() => inputNum("6")} />
        <Btn label="=" variant="op" onClick={equals} />

        <Btn label="1" onClick={() => inputNum("1")} />
        <Btn label="2" onClick={() => inputNum("2")} />
        <Btn label="3" onClick={() => inputNum("3")} />
        <Btn label="." onClick={inputDot} />

        <div className="col-span-2">
          <button onClick={() => inputNum("0")} className="w-full h-12 rounded-xl text-sm font-bold text-white transition active:scale-95" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }}>0</button>
        </div>
        <Btn label="⌫" variant="fn" onClick={() => setDisplay(display.length > 1 ? display.slice(0, -1) : "0")} />
      </div>
    </div>
  );
}