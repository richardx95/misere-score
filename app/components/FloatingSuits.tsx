"use client";
import React, { memo } from "react";

const SUITS = [
  { char: "♠", type: "black", left: "6%", delay: "0s", duration: "16s", anim: "fall1" },
  { char: "♥", type: "red", left: "19%", delay: "4s", duration: "19s", anim: "fall2" },
  { char: "♦", type: "red", left: "32%", delay: "2s", duration: "17s", anim: "fall3" },
  { char: "♣", type: "black", left: "46%", delay: "7s", duration: "21s", anim: "fall4" },
  { char: "♠", type: "black", left: "58%", delay: "1s", duration: "18s", anim: "fall2" },
  { char: "♥", type: "red", left: "71%", delay: "5s", duration: "20s", anim: "fall1" },
  { char: "♦", type: "red", left: "84%", delay: "3s", duration: "16s", anim: "fall4" },
  { char: "♣", type: "black", left: "94%", delay: "8s", duration: "22s", anim: "fall3" },
];

export const FloatingSuits = memo(function FloatingSuits() {
  return (
    <div className="floating-suits-container" aria-hidden="true">
      {SUITS.map((item, idx) => (
        <span
          key={idx}
          className={`suit-icon ${item.type === "red" ? "suit-red" : "suit-black"}`}
          style={{
            left: item.left,
            animation: `${item.anim} ${item.duration} infinite linear`,
            animationDelay: item.delay,
          }}
        >
          {item.char}
        </span>
      ))}
    </div>
  );
});

export default FloatingSuits;
