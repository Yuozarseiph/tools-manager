"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";

type Shape3D = "sphere" | "cube" | "cylinder" | "cone";

export default function Geometry3D() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [shape, setShape] = useState<Shape3D>("sphere");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, number> | null>(null);

  const shapes: { id: Shape3D; name: string }[] = [
    { id: "sphere", name: content.geometry3d.shapes.sphere },
    { id: "cube", name: content.geometry3d.shapes.cube },
    { id: "cylinder", name: content.geometry3d.shapes.cylinder },
    { id: "cone", name: content.geometry3d.shapes.cone },
  ];

  const calculate = () => {
    const vals = Object.fromEntries(
      Object.entries(inputs).map(([k, v]) => [k, parseFloat(v)])
    );

    let res: Record<string, number> = {};
    const PI = Math.PI;

    switch (shape) {
      case "sphere":
        const r = vals.radius || 0;
        res = {
          [content.geometry3d.labels.volume]: (4 / 3) * PI * Math.pow(r, 3),
          [content.geometry3d.labels.surfaceArea]: 4 * PI * r * r,
        };
        break;
      case "cube":
        const a = vals.side || 0;
        res = {
          [content.geometry3d.labels.volume]: Math.pow(a, 3),
          [content.geometry3d.labels.surfaceArea]: 6 * a * a,
          [content.geometry3d.labels.spaceDiagonal]: a * Math.sqrt(3),
        };
        break;
      case "cylinder":
        const rc = vals.radius || 0;
        const h = vals.height || 0;
        res = {
          [content.geometry3d.labels.volume]: PI * rc * rc * h,
          [content.geometry3d.labels.surfaceArea]: 2 * PI * rc * (rc + h),
        };
        break;
      case "cone":
        const rco = vals.radius || 0;
        const hco = vals.height || 0;
        const l = Math.sqrt(rco * rco + hco * hco);
        res = {
          [content.geometry3d.labels.volume]: (1 / 3) * PI * rco * rco * hco,
          [content.geometry3d.labels.surfaceArea]: PI * rco * (rco + l),
        };
        break;
    }

    setResults(
      Object.fromEntries(
        Object.entries(res).map(([k, v]) => [k, parseFloat(v.toFixed(4))])
      )
    );
  };

  const inputFields: Record<Shape3D, { key: string; label: string }[]> = {
    sphere: [{ key: "radius", label: content.geometry3d.labels.radius }],
    cube: [{ key: "side", label: content.geometry3d.labels.side }],
    cylinder: [
      { key: "radius", label: content.geometry3d.labels.radius },
      { key: "height", label: content.geometry3d.labels.height },
    ],
    cone: [
      { key: "radius", label: content.geometry3d.labels.radius },
      { key: "height", label: content.geometry3d.labels.height },
    ],
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
