# Claude 인계 메모

## 이번 턴에서 끝낸 일

- `frontend/public/data/lectures/2026-02-02-sections.json` ~ `2026-02-27-sections.json`
  15개 파일을 원문 txt 기준으로 다시 읽고, 전체 타임라인을 끝까지 덮도록 보정했어요.
- `break`는 실제 공백 구간만 남기고, 원문 첫 줄 `start`와 마지막 줄 `end`가 JSON과 정확히 맞도록 정리했어요.
- `frontend/public/data/evaluations/2026-02-02.json` ~ `2026-02-27.json`
  15개 파일을 원문 txt, sections JSON, `강의 품질 기준.md` 기준으로 다시 평가했어요.
- 모든 evaluation JSON이 `18개 항목` 구조를 유지하도록 맞췄고, `break` 제외 섹션마다 최소 1개 이상 evidence가 걸리도록 coverage를 채웠어요.
- `frontend/src/app/lectures/[date]/page.tsx`에서 섹션과 시뮬레이션 세그먼트를 문자열로 비교하던 부분을 12시간제 보정 초 비교로 바꿨어요.

## 검증 결과

- `frontend/public/data/lectures/*.json`: 원문 첫/끝 시각 일치, 인접 구간 연속성 확인
- `frontend/public/data/evaluations/*.json`: `jq empty` 통과
- evaluation JSON 15개 전부: `items = 18`
- evaluation JSON 15개 전부: `break` 제외 섹션 coverage `0건`
- `cd frontend && npm run build` 통과

## 강의별 한줄 흐름 요약

### 2026-02-02

오전에는 Java I/O와 스트림 구조를 잡고 `FileReader`, `BufferedReader` 실습으로 읽기 흐름을 익혀요. 오후에는 `Files`, `Path`, `FileVisitor`로 파일 시스템 탐색을 확장한 뒤 MySQL 설치 안내로 다음 수업을 열어요.

### 2026-02-03

I/O 복습에서 시작해 파일 형식과 RDBMS 기본 개념을 연결하고, 곧바로 MySQL 설치 구조와 `my.ini`, Workbench 연결을 따라가요. 오후에는 `LOAD DATA`, `local_infile`, 바이너리 로그까지 보면서 실제 DB 환경을 세팅해요.

### 2026-02-04

MySQL 설치 구조, 로그, 메타데이터 파일을 먼저 읽고 Workbench 연결과 스키마 생성을 화면 중심으로 정리해요. 오후에는 `SELECT`, `ORDER BY`, `LIKE`, `BETWEEN`, `IN`을 실습으로 풀며 조회문의 기본기를 다져요.

### 2026-02-05

정형·반정형 데이터와 DDL/DML 구조를 다시 묶고, 데이터 타입과 제약조건을 테이블 설계 관점에서 정리해요. 이후 `UTF8MB4`, 집계함수, `GROUP BY`, `ROLLUP`까지 이어가며 조회와 집계의 감각을 넓혀요.

### 2026-02-06

문자열 함수와 정규식 패턴 매칭을 먼저 다루고, `REGEXP`, `INSTR`, 문자셋 차이를 실습으로 확인해요. 오후에는 컬레이션, `GROUP_CONCAT`, 윈도우 함수, `ROW_NUMBER`, `LAST_VALUE`까지 이어서 분석형 SQL 흐름을 잡아요.

### 2026-02-09

`CONCAT`, `SUBSTR`, `LOCATE`, `REPLACE`, `TRIM`을 묶어 문자열 함수를 연속 실습으로 익혀요. 이어서 `LOAD_FILE`, BLOB/TEXT, 문자셋과 콜레이션을 연결해 파일 적재와 인코딩 이슈를 같이 봐요.

### 2026-02-10

`INNER JOIN`부터 `LEFT/RIGHT OUTER JOIN`, `SELF JOIN`, `CROSS JOIN`까지 결과 차이를 비교하면서 조인 지형을 넓게 잡아요. 오후에는 `EXPLAIN`과 인덱스 비용까지 붙여서 조인을 성능 관점으로 확장해요.

### 2026-02-11

집합 연산자와 단일·다중행 서브쿼리를 먼저 비교하고, `ANY`, `ALL`이 어디서 갈리는지 차근차근 짚어요. 이후 인라인 뷰와 `EXISTS`까지 이어가며 같은 문제를 여러 방식으로 푸는 흐름을 보여줘요.

### 2026-02-12

`WITH`와 재귀 CTE를 중심으로 임시 결과를 만드는 방법을 설명하고, 계층 구조 예제로 재귀 흐름을 익혀요. 후반에는 `INFORMATION_SCHEMA`로 넘어가 메타데이터를 직접 조회하면서 DB 내부 구조를 읽어요.

### 2026-02-13

트랜잭션 제어와 참조 무결성 옵션을 먼저 정리하고, `COMMIT`, `ROLLBACK`, `SAVEPOINT`를 실제 세션 흐름으로 확인해요. 이후 ACID, 잠금, `INNODB_TRX`, 바이너리 로그까지 묶어 실무형 트랜잭션 감각을 만들어요.

### 2026-02-23

뷰의 목적과 한계를 먼저 잡고 `CREATE VIEW`, 조인 뷰, `WITH CHECK OPTION`을 실습으로 확인해요. 오후에는 프로시저, 커서, `SQLSTATE`, 루프까지 이어서 프로그램형 SQL 흐름으로 넘어가요.

### 2026-02-24

프로시저 예외 처리에서 이어져 `HANDLER`, `SIGNAL`, `SQLSTATE`를 에러 코드 중심으로 다뤄요. 오후에는 함수 속성과 파티션으로 넘어가 `DETERMINISTIC`, `RANGE`, `LIST`, `HASH`를 실습으로 묶어요.

### 2026-02-25

파티션이 왜 필요한지부터 짚고 `RANGE`, `LIST` 파티션을 테이블 설계 관점에서 확인해요. 후반에는 `B-Tree`, 복합 인덱스, 유니크 인덱스, 인비저블 인덱스까지 이어서 조회 성능의 감각을 잡아요.

### 2026-02-26

권한 구조를 복습한 뒤 `GRANT`, `REVOKE`, 역할 기반 권한을 실제 계정 생성 흐름에 붙여서 설명해요. 이어서 `CREATE USER`, JSON 속성, 계정 락 옵션, 트리거 기초까지 연결하며 운영 관점의 DB 관리로 넓혀요.

### 2026-02-27

덤프 백업과 스키마/데이터 분리를 먼저 정리하고, CMD와 Workbench에서 export 흐름을 실제로 따라가요. 마지막에는 트리거, ERD 관계, JDBC 예고까지 붙여서 DB 관리에서 애플리케이션 연결로 시선을 옮겨요.

## 지금 코드/데이터 상태

- sections JSON 15개는 전체 강의 타임라인을 끝까지 덮어요.
- evaluation JSON 15개는 프론트에서 바로 쓸 수 있는 상태예요.
- 상세 페이지 타임라인은 12시간제 래핑을 고려해 section/evidence/simulation을 같은 규칙으로 매핑해요.

## 다음에 보면 좋은 파일

- [memory/current-state.md](/Users/youngjinson/멋사-인턴/memory/current-state.md)
- [memory/decisions.md](/Users/youngjinson/멋사-인턴/memory/decisions.md)
- [frontend/src/app/lectures/[date]/page.tsx](/Users/youngjinson/멋사-인턴/frontend/src/app/lectures/[date]/page.tsx)
- [frontend/public/data/lectures](/Users/youngjinson/멋사-인턴/frontend/public/data/lectures)
- [frontend/public/data/evaluations](/Users/youngjinson/멋사-인턴/frontend/public/data/evaluations)

## 아직 남아 있는 일

1. sections/evaluations를 프론트 카드와 상세 화면에서 더 잘 활용할지 결정해요.
2. LangGraph 배치 평가 결과와 수작업 재평가 JSON을 어떤 기준으로 병행 운영할지 정해요.
3. 필요하면 강의별 한줄 흐름 요약을 프론트 데이터로도 노출해요.
