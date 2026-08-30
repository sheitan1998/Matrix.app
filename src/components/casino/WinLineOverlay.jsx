import React from "react";
import { motion } from "framer-motion";

/**
 * WinLineOverlay — trace des lignes lumineuses neon reliant les symboles gagnants.
 * Dessine un SVG par-dessus la grille, animant un trait lumineux du premier
 * au dernier symbole gagnant sur chaque ligne gagnante.
 */
export default function WinLineOverlay({ winningCells, showResult, spinning, theme }) {
  if (!showResult || spinning || !winningCells) return null;

  // Trouve les lignes gagnantes (rangées avec 3+ symboles alignes)
  const winLines = [];
  for (let row = 0; row < 3; row++) {
    const winningCols = [];
    for (let col = 0; col < 5; col++) {
      if (winningCells[col]?.[row]) winningCols.push(col);
    }
    if (winningCols.length >= 3) {
      winLines.push({
        row,
        startCol: winningCols[0],
        endCol: winningCols[winningCols.length - 1],
      });
    }
  }

  if (winLines.length === 0) return null;

  // Positions des centres des cellules dans le viewBox 0-100
  const colCenter = (col) => (col + 0.5) * (100 / 5);
  const rowCenter = (row) => (row + 0.5) * (100 / 3);

  const accent = theme.frameAccent || "#d4af37";

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ zIndex: 20 }}
    >
      {/* Halo lumineux sous la ligne */}
      {winLines.map((line, i) => (
        <motion.line
          key={`halo-${i}`}
          x1={colCenter(line.startCol)}
          y1={rowCenter(line.row)}
          x2={colCenter(line.endCol)}
          y2={rowCenter(line.row)}
          stroke={accent}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        />
      ))}
      {/* Ligne neon principale */}
      {winLines.map((line, i) => (
        <motion.line
          key={`line-${i}`}
          x1={colCenter(line.startCol)}
          y1={rowCenter(line.row)}
          x2={colCenter(line.endCol)}
          y2={rowCenter(line.row)}
          stroke={accent}
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 1px ${accent}) drop-shadow(0 0 3px ${accent})` }}
        />
      ))}
      {/* Points lumineux aux extremites */}
      {winLines.map((line, i) => (
        <motion.circle
          key={`dot-start-${i}`}
          cx={colCenter(line.startCol)}
          cy={rowCenter(line.row)}
          r="1.5"
          fill={accent}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
          style={{ filter: `drop-shadow(0 0 2px ${accent})` }}
        />
      ))}
      {winLines.map((line, i) => (
        <motion.circle
          key={`dot-end-${i}`}
          cx={colCenter(line.endCol)}
          cy={rowCenter(line.row)}
          r="1.5"
          fill={accent}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
          style={{ filter: `drop-shadow(0 0 2px ${accent})` }}
        />
      ))}
    </svg>
  );
}