import { useRole } from "@/contexts/RoleContext";
import FileUpload from "@/components/shared/FileUpload";
import PromptViewer from "@/components/shared/PromptViewer";

export default function OperatorToolsSection() {
  const { isOperator } = useRole();
  if (!isOperator) return null;

  return (
    <>
      {/* 파일 업로드 */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 4 }}>
          트랜스크립트 업로드
        </h2>
        <p className="text-caption" style={{ marginBottom: 20 }}>
          분석할 강의 녹취 파일을 추가합니다
        </p>
        <FileUpload onUpload={(files) => console.log(files)} />
      </div>

      {/* 평가 기준 */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 4 }}>
          평가 기준 (하네스)
        </h2>
        <p className="text-caption" style={{ marginBottom: 20 }}>
          각 카테고리별 평가 프롬프트를 확인하고, 추가 지시사항을 입력할 수
          있습니다
        </p>
        <PromptViewer editable />
      </div>
    </>
  );
}
