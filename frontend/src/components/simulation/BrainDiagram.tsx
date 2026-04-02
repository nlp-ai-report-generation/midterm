/** 2D 뇌 다이어그램 (측면 실루엣) — 영역별 하이라이트 */
interface BrainDiagramProps {
  highlighted?: string | null;
}

const COLORS: Record<string, string> = {
  executive: "#4A90D9",
  attention: "#7B61FF",
  auditory: "#FF6B00",
  language: "#FF9F4A",
  visual: "#34C759",
  memory: "#FF3B30",
  conflict: "#FF9500",
  dmn: "#86868b",
};

export default function BrainDiagram({ highlighted }: BrainDiagramProps) {
  const isOn = (key: string) => highlighted === key;
  const fill = (key: string) => isOn(key) ? COLORS[key] : "#e8e8ed";
  const opacity = (key: string) => isOn(key) ? 0.75 : 0.35;
  const textFill = (key: string) => isOn(key) ? "#fff" : "#a0a0a5";
  const textWeight = (key: string) => isOn(key) ? 600 : 400;
  const textSize = (key: string) => isOn(key) ? 9 : 7;

  return (
    <svg viewBox="0 0 280 180" width="100%" height="100%" style={{ maxHeight: 200 }}>
      {/* 뇌 실루엣 (측면) */}
      <path
        d="M 60 140 C 30 130, 15 100, 20 75 C 25 50, 40 30, 70 20 C 100 10, 140 8, 175 15 C 210 22, 240 40, 250 65 C 260 90, 250 115, 230 130 C 215 140, 195 148, 170 150 C 145 152, 120 150, 95 148 C 80 147, 65 145, 60 140 Z"
        fill="#f0f0f2"
        stroke="#d2d2d7"
        strokeWidth={1.2}
      />
      {/* 뇌줄기 */}
      <path
        d="M 95 148 C 90 155, 85 162, 88 170 C 91 175, 100 175, 105 170 C 108 165, 105 158, 100 150"
        fill="#e8e8ed"
        stroke="#d2d2d7"
        strokeWidth={1}
      />
      {/* 소뇌 */}
      <ellipse cx={210} cy={142} rx={28} ry={16} fill="#eaeaef" stroke="#d2d2d7" strokeWidth={0.8} />

      {/* === 영역들 === */}

      {/* 전두엽 (Executive) — 앞쪽 상단 */}
      <ellipse cx={70} cy={55} rx={38} ry={30} fill={fill("executive")} opacity={opacity("executive")} />
      <text x={70} y={58} textAnchor="middle" fontSize={textSize("executive")} fontWeight={textWeight("executive")} fill={textFill("executive")}>전두엽</text>

      {/* 두정엽 (Attention) — 상단 중앙 */}
      <ellipse cx={145} cy={40} rx={35} ry={24} fill={fill("attention")} opacity={opacity("attention")} />
      <text x={145} y={43} textAnchor="middle" fontSize={textSize("attention")} fontWeight={textWeight("attention")} fill={textFill("attention")}>두정엽</text>

      {/* 후두엽 (Visual) — 뒤쪽 */}
      <ellipse cx={225} cy={80} rx={25} ry={30} fill={fill("visual")} opacity={opacity("visual")} />
      <text x={225} y={83} textAnchor="middle" fontSize={textSize("visual")} fontWeight={textWeight("visual")} fill={textFill("visual")}>후두엽</text>

      {/* 측두엽 (Auditory) — 아래쪽 앞 */}
      <ellipse cx={80} cy={110} rx={35} ry={20} fill={fill("auditory")} opacity={opacity("auditory")} />
      <text x={80} y={113} textAnchor="middle" fontSize={textSize("auditory")} fontWeight={textWeight("auditory")} fill={textFill("auditory")}>측두엽</text>

      {/* Wernicke (Language) — 측두-두정 접합 */}
      <ellipse cx={155} cy={100} rx={24} ry={16} fill={fill("language")} opacity={opacity("language")} />
      <text x={155} y={103} textAnchor="middle" fontSize={textSize("language")} fontWeight={textWeight("language")} fill={textFill("language")}>Wernicke</text>

      {/* 전대상회 (Conflict) — 내측 중앙 */}
      <ellipse cx={110} cy={65} rx={18} ry={12} fill={fill("conflict")} opacity={opacity("conflict")} />
      <text x={110} y={68} textAnchor="middle" fontSize={textSize("conflict")} fontWeight={textWeight("conflict")} fill={textFill("conflict")}>ACC</text>

      {/* 해마 (Memory) — 내측 하단 */}
      <ellipse cx={130} cy={125} rx={18} ry={12} fill={fill("memory")} opacity={opacity("memory")} />
      <text x={130} y={128} textAnchor="middle" fontSize={textSize("memory")} fontWeight={textWeight("memory")} fill={textFill("memory")}>해마</text>

      {/* DMN — 후대상회 */}
      <ellipse cx={190} cy={60} rx={22} ry={16} fill={fill("dmn")} opacity={opacity("dmn")} />
      <text x={190} y={63} textAnchor="middle" fontSize={textSize("dmn")} fontWeight={textWeight("dmn")} fill={textFill("dmn")}>DMN</text>
    </svg>
  );
}
