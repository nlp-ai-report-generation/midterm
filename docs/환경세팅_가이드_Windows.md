# 환경 세팅 가이드 — Windows

> **프로젝트:** AI 강의 분석 리포트 생성기  
> **대상:** Windows 10 / 11 사용자  
> **소요 시간:** 약 30~40분

---

## Step 1. Python 설치

### 1-1. 현재 설치 여부 확인

명령 프롬프트(CMD) 또는 PowerShell을 열고 아래 명령을 입력한다.

```
python --version
```

`Python 3.11.x` 이상이 출력되면 Step 2로 넘어간다. "명령을 찾을 수 없습니다"가 뜨거나 3.10 이하라면 아래 과정을 진행한다.

### 1-2. Python 다운로드

1. https://www.python.org/downloads/ 에 접속한다.
2. 상단의 **"Download Python 3.12.x"** (또는 최신 3.11 이상) 버튼을 클릭한다.
3. 다운로드된 설치 파일(`python-3.x.x-amd64.exe`)을 실행한다.

### 1-3. 설치 시 주의사항

설치 화면 하단에 **"Add python.exe to PATH"** 체크박스가 있다. **반드시 체크**한 뒤 "Install Now"를 클릭한다. 이걸 빠뜨리면 터미널에서 python 명령이 인식되지 않는다.

설치가 완료되면 터미널을 **새로 열어서** 다시 확인한다.

```
python --version
pip --version
```

두 명령 모두 버전이 출력되면 정상이다.

---

## Step 2. Java (JDK) 설치

KoNLPy가 내부적으로 Java를 사용하므로 JDK 설치가 필수다.

### 2-1. 현재 설치 여부 확인

```
java -version
```

`openjdk version "11.x.x"` 이상이 출력되면 Step 3으로 넘어간다.

### 2-2. JDK 다운로드

1. https://adoptium.net/ 에 접속한다.
2. **Temurin 11 (LTS)** 또는 **Temurin 17 (LTS)** 중 하나를 선택한다. (11 권장)
3. Operating System은 **Windows**, Architecture는 **x64**를 선택한다.
4. `.msi` 설치 파일을 다운로드하여 실행한다.

### 2-3. 설치 중 옵션 설정

설치 중 **"Set JAVA_HOME variable"** 옵션이 나오면 반드시 **활성화**한다. 이 옵션을 놓치면 아래처럼 수동으로 설정해야 한다.

### 2-4. 수동 환경변수 설정 (위 옵션을 놓친 경우)

1. Windows 검색창에 **"환경 변수"** 를 입력하고 **"시스템 환경 변수 편집"** 을 클릭한다.
2. **"환경 변수"** 버튼을 클릭한다.
3. **시스템 변수** 영역에서 **"새로 만들기"** 를 클릭한다.
   - 변수 이름: `JAVA_HOME`
   - 변수 값: JDK 설치 경로 (예: `C:\Program Files\Eclipse Adoptium\jdk-11.0.xx-hotspot`)
4. **시스템 변수** 목록에서 **Path**를 선택 → **"편집"** → **"새로 만들기"** 를 클릭한다.
   - `%JAVA_HOME%\bin` 을 추가한다.
5. 확인을 눌러 모두 닫는다.

### 2-5. 설치 확인

터미널을 **새로 열어서** 확인한다. (환경변수 변경은 기존 터미널에 반영되지 않는다.)

```
java -version
echo %JAVA_HOME%
```

두 명령 모두 정상 출력되면 완료다.

---

## Step 3. Git 설치

### 3-1. 현재 설치 여부 확인

```
git --version
```

버전이 출력되면 Step 4로 넘어간다.

### 3-2. Git 다운로드 및 설치

1. https://git-scm.com/download/win 에 접속한다.
2. **"64-bit Git for Windows Setup"** 을 다운로드하여 실행한다.
3. 설치 옵션은 대부분 기본값으로 두되, **"Adjusting your PATH environment"** 단계에서 **"Git from the command line and also from 3rd-party software"** (권장 옵션, 기본 선택됨)를 확인한다.

### 3-3. 설치 후 초기 설정

```
git config --global user.name "본인 이름"
git config --global user.email "본인 이메일"
```

---

## Step 4. 프로젝트 클론

### 4-1. 작업 폴더로 이동

```
cd C:\Users\본인계정\Documents
```

### 4-2. 레포지토리 클론

```
git clone https://github.com/nlp-ai-report-generation/init.git
cd init
```

> 아직 레포지토리가 없다면 담당자 A가 먼저 GitHub에 생성하고 URL을 팀원에게 공유한다.

---

## Step 5. 가상환경(venv) 생성 및 활성화

### 5-1. venv 생성

프로젝트 루트 디렉토리에서 아래 명령을 실행한다.

```
python -m venv .venv
```

`.venv` 폴더가 생성된다. 이 폴더는 Git에 올리지 않는다 (.gitignore에 이미 포함).

### 5-2. venv 활성화

**CMD (명령 프롬프트):**
```
.venv\Scripts\activate.bat
```

**PowerShell:**
```
.venv\Scripts\Activate.ps1
```

> **PowerShell에서 오류가 나는 경우:**  
> "이 시스템에서 스크립트를 실행할 수 없습니다"라는 오류가 뜨면, PowerShell을 **관리자 권한**으로 열고 아래 명령을 한 번 실행한다.  
> ```
> Set-ExecutionPolicy RemoteSigned
> ```
> 이후 다시 프로젝트 폴더로 돌아와서 활성화 명령을 재실행한다.

### 5-3. 활성화 확인

활성화되면 터미널 앞에 `(.venv)` 표시가 나타난다.

```
(.venv) C:\Users\...\init>
```

추가로 아래 명령으로 Python 경로가 `.venv` 안을 가리키는지 확인한다.

```
where python
```

출력 결과에 `.venv\Scripts\python.exe` 경로가 포함되어 있으면 정상이다.

### 5-4. venv 비활성화 (작업 종료 시)

```
deactivate
```

---

## Step 6. 라이브러리 설치

### 6-1. pip 업그레이드 (선행)

```
python -m pip install --upgrade pip
```

### 6-2. 본인 담당 모듈에 맞는 라이브러리 설치

**담당자 A (전처리 + 인프라):**
```
pip install -r requirements/preprocessing.txt
pip install -r requirements/dev.txt
```

**담당자 B (규칙 기반 분석):**
```
pip install -r requirements/rule_analysis.txt
pip install -r requirements/dev.txt
```

**담당자 C (LLM 분석):**
```
pip install -r requirements/llm_analysis.txt
pip install -r requirements/dev.txt
```

**담당자 D (리포트 + UI):**
```
pip install -r requirements/report_ui.txt
pip install -r requirements/dev.txt
```

### 6-3. 설치 확인

```
pip list
```

설치된 패키지 목록이 출력되면 정상이다.

---

## Step 7. 환경변수 설정 (.env)

### 7-1. .env 파일 생성

```
copy .env.example .env
```

### 7-2. .env 파일 편집

메모장 또는 VS Code로 `.env` 파일을 열고 API 키를 입력한다.

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

> **주의:** `.env` 파일은 절대 Git에 올리지 않는다. `.gitignore`에 이미 포함되어 있지만, 실수로 `git add .`를 하지 않도록 주의한다.

---

## Step 8. 환경 검증

### 8-1. 검증 스크립트 실행

```
python scripts/check_env.py
```

모든 항목이 OK로 표시되면 환경 세팅이 완료된 것이다.

### 8-2. 항목별 예상 출력

```
=======================================================
  환경 세팅 검증
=======================================================
[Python]  3.12.x  ...  OK
[Java]    openjdk version "11.0.x"  ...  OK
[venv]    활성화됨  ...  OK

[패키지 상태]
  python-dotenv          ... OK
  pyyaml                 ... OK
  konlpy                 ... OK (담당자 A, B)
  pandas                 ... OK (담당자 A, B)
  langchain              ... 미설치 (담당자 C만 필요)
  streamlit              ... 미설치 (담당자 D만 필요)
  python-docx            ... 미설치 (담당자 D만 필요)
=======================================================
```

자기 담당이 아닌 패키지가 "미설치"로 나오는 것은 정상이다.

### 8-3. 테스트 실행

```
pytest tests/ -v
```

기존 테스트가 통과하면 개발을 시작할 준비가 된 것이다.

---

## Step 9. 일상 작업 흐름

매일 작업을 시작할 때 아래 순서를 따른다.

### 9-1. 터미널을 열고 프로젝트 폴더로 이동

```
cd C:\Users\본인계정\Documents\init
```

### 9-2. venv 활성화

```
.venv\Scripts\activate.bat
```

### 9-3. 최신 코드 받기

```
git checkout develop
git pull origin develop
```

### 9-4. 자기 브랜치로 이동 (또는 새 브랜치 생성)

```
git checkout feature/a-preprocessing
```

또는 새 브랜치를 만들 때:

```
git checkout -b feature/a-새기능이름
```

### 9-5. requirements 변경 확인

다른 팀원이 requirements 파일을 수정했다면 재설치한다.

```
pip install -r requirements/base.txt
pip install -r requirements/본인모듈.txt
```

### 9-6. 작업 후 커밋 및 푸시

```
git add .
git commit -m "feat: 반복 표현 검출 로직 구현"
git push origin feature/a-preprocessing
```

### 9-7. 작업 종료 시

```
deactivate
```

---

## 자주 발생하는 문제 해결

### "python" 명령이 인식되지 않음

Python 설치 시 "Add to PATH" 옵션을 빠뜨린 경우다. Python을 재설치하거나, 시스템 환경변수 Path에 Python 설치 경로를 수동으로 추가한다 (예: `C:\Users\본인계정\AppData\Local\Programs\Python\Python312\`).

### PowerShell에서 venv 활성화가 안 됨

실행 정책 문제다. 관리자 권한 PowerShell에서 `Set-ExecutionPolicy RemoteSigned`를 실행한 뒤 다시 시도한다.

### KoNLPy import 시 "No JVM shared library file" 오류

JAVA_HOME 환경변수가 설정되지 않았거나 경로가 잘못된 경우다. `echo %JAVA_HOME%` 으로 경로를 확인하고, JDK 설치 폴더를 정확히 가리키는지 점검한다. 환경변수 변경 후에는 반드시 터미널을 새로 열어야 한다.

### pip install 시 "Microsoft Visual C++ 14.0 is required" 오류

일부 패키지가 C 확장을 빌드할 때 발생한다. https://visualstudio.microsoft.com/visual-cpp-build-tools/ 에서 **"Build Tools for Visual Studio"** 를 설치하고, 설치 옵션에서 **"C++ build tools"** 워크로드를 선택한다.

### git push 시 인증 오류

GitHub에서 2021년 이후 비밀번호 인증이 차단되었다. **Personal Access Token (PAT)** 을 발급받아 비밀번호 대신 입력하거나, SSH 키를 등록한다. GitHub > Settings > Developer settings > Personal access tokens에서 발급 가능하다.

