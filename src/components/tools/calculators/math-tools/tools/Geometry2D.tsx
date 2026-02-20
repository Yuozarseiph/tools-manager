"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";

type Shape = "circle" | "rectangle" | "triangle" | "square";

export default function Geometry2D() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [shape, setShape] = useState<Shape>("circle");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, number> | null>(null);

  const shapes: { id: Shape; name: string }[] = [
    { id: "circle", name: content.geometry2d.shapes.circle },
    { id: "rectangle", name: content.geometry2d.shapes.rectangle },
    { id: "triangle", name: content.geometry2d.shapes.triangle },
    { id: "square", name: content.geometry2d.shapes.square },
  ];

  const calculate = () => {
    const vals = Object.fromEntries(
      Object.entries(inputs).map(([k, v]) => [k, parseFloat(v)])
    );

    let res: Record<string, number> = {};

    switch (shape) {
      case "circle":
        const r = vals.radius || 0;
        res = {
          [content.geometry2d.labels.perimeter]: 2 * Math.PI * r,
          [content.geometry2d.labels.area]: Math.PI * r * r,
          [content.geometry2d.labels.diameter]: 2 * r,
        };
        break;
      case "rectangle":
        const w = vals.width || 0;
        const h = vals.height || 0;
        res = {
          [content.geometry2d.labels.perimeter]: 2 * (w + h),
          [content.geometry2d.labels.area]: w * h,
          [content.geometry2d.labels.diameter]: Math.sqrt(w * w + h * h),
        };
        break;
      case "triangle":
        const a = vals.a || 0;
        const b = vals.b || 0;
        const c = vals.c || 0;
        const s = (a + b + c) / 2;
        res = {
          [content.geometry2d.labels.perimeter]: a + b + c,
          [content.geometry2d.labels.area]: Math.sqrt(
            s * (s - a) * (s - b) * (s - c)
          ),
        };
        break;
      case "square":
        const side = vals.side || 0;
        res = {
          [content.geometry2d.labels.perimeter]: 4 * side,
          [content.geometry2d.labels.area]: side * side,
          [content.geometry2d.labels.diameter]: side * Math.SQRT2,
        };
        break;
    }

    setResults(
      Object.fromEntries(
        Object.entries(res).map(([k, v]) => [k, parseFloat(v.toFixed(4))])
      )
    );
  };

  const inputFields: Record<Shape, { key: string; label: string }[]> = {
    circle: [{ key: "radius", label: content.geometry2d.labels.radius }],
    rectangle: [
      { key: "width", label: content.geometry2d.labels.width },
      { key: "height", label: content.geometry2d.labels.height },
    ],
    triangle: [
      { key: "a", label: content.geometry2d.labels.sideA },
      { key: "b", label: content.geometry2d.labels.sideB },
      { key: "c", label: content.geometry2d.labels.sideC },
    ],
    square: [{ key: "side", label: content.geometry2d.labels.side }],
  };

  return (
    <div className="space-y-6">
      {/* Shape Selection */}
      <div className="flex flex-wrap gap-2">
        {shapes.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setShape(s.id);
              setInputs({});
              setResults(null);
            }}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              shape === s.id
                ? `${theme.primary} text-white`
                : `${theme.bg} ${theme.text} border ${theme.border}`
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inputFields[shape].map((field) => (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
              {field.label}
            </label>
            <input
              type="number"
              value={inputs[field.key] || ""}
              onChange={(e) =>
                setInputs({ ...inputs, [field.key]: e.target.value })
              }
              className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            />
          </div>
        ))}
      </div>

      <button
        onClick={calculate}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.common.calculate}
      </button>

      {results && (
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(results).map(([key, value]) => (
            <div
              key={key}
              className={`p-4 rounded-xl border ${theme.border} ${theme.bg} text-center`}
            >
              <p className={`text-sm ${theme.textMuted}`}>{key}</p>
              <p className={`text-xl font-bold ${theme.text}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
