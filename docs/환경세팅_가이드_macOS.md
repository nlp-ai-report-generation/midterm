# 환경 세팅 가이드 — macOS

> **프로젝트:** AI 강의 분석 리포트 생성기  
> **대상:** macOS 사용자 (Intel / Apple Silicon 모두 해당)  
> **소요 시간:** 약 30~40분

---

## Step 0. Homebrew 설치 (사전 준비)

macOS에서는 Homebrew를 통해 대부분의 개발 도구를 설치한다. 이미 설치되어 있다면 Step 1로 넘어간다.

### 0-1. 설치 여부 확인

터미널(Terminal.app)을 열고 아래 명령을 입력한다.

```bash
brew --version
```

버전이 출력되면 Step 1로 넘어간다. "command not found"가 뜨면 아래를 진행한다.

### 0-2. Homebrew 설치

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

설치가 끝나면 터미널에 출력되는 안내 메시지를 확인한다. **Apple Silicon(M1/M2/M3) Mac인 경우** 아래 명령을 추가로 실행해야 한다. (Intel Mac은 불필요)

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

설치 확인:

```bash
brew --version
```

---

## Step 1. Python 설치

### 1-1. 현재 설치 여부 확인

```bash
python3 --version
```

`Python 3.11.x` 이상이 출력되면 Step 2로 넘어간다.

> **주의:** macOS에는 시스템 Python(2.x 또는 3.8)이 기본 탑재되어 있지만 버전이 낮다. `python3 --version`으로 확인했을 때 3.10 이하라면 새로 설치한다.

### 1-2. Python 설치

```bash
brew install python@3.12
```

설치 후 확인:

```bash
python3 --version
pip3 --version
```

`Python 3.12.x`가 출력되면 정상이다.

### 1-3. python3 → python 별칭 설정 (선택)

macOS에서는 기본적으로 `python3`, `pip3` 명령을 사용한다. 팀원 간 명령어 통일을 위해 별칭을 설정해두면 편하다.

```bash
echo 'alias python=python3' >> ~/.zshrc
echo 'alias pip=pip3' >> ~/.zshrc
source ~/.zshrc
```

이후 `python --version`으로도 확인 가능해진다.

---

## Step 2. Java (JDK) 설치

KoNLPy가 내부적으로 Java를 사용하므로 JDK 설치가 필수다.

### 2-1. 현재 설치 여부 확인

```bash
java -version
```

`openjdk version "11.x.x"` 이상이 출력되면 Step 3으로 넘어간다.

### 2-2. JDK 설치

```bash
brew install openjdk@11
```

### 2-3. 환경변수 설정

Homebrew로 설치한 JDK는 자동으로 PATH에 연결되지 않는다. 아래 명령으로 연결한다.

```bash
# 심볼릭 링크 생성
sudo ln -sfn $(brew --prefix openjdk@11)/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-11.jdk

# JAVA_HOME 환경변수 설정
echo 'export JAVA_HOME=$(brew --prefix openjdk@11)' >> ~/.zshrc
source ~/.zshrc
```

### 2-4. 설치 확인

```bash
java -version
echo $JAVA_HOME
```

두 명령 모두 정상 출력되면 완료다.

---

## Step 3. Git 설치 및 설정

### 3-1. 현재 설치 여부 확인

```bash
git --version
```

macOS는 Xcode Command Line Tools에 Git이 포함되어 있어 대부분 이미 설치되어 있다. 만약 설치 팝업이 뜨면 "설치"를 클릭한다.

설치되어 있지 않다면:

```bash
xcode-select --install
```

### 3-2. 초기 설정

```bash
git config --global user.name "본인 이름"
git config --global user.email "본인 이메일"
```

---

## Step 4. 프로젝트 클론

### 4-1. 작업 폴더로 이동

```bash
cd ~/Documents
```

### 4-2. 레포지토리 클론

```bash
git clone https://github.com/nlp-ai-report-generation/init.git
cd init
```

> 아직 레포지토리가 없다면 담당자 A가 먼저 GitHub에 생성하고 URL을 팀원에게 공유한다.

---

## Step 5. 가상환경(venv) 생성 및 활성화

### 5-1. venv 생성

프로젝트 루트 디렉토리에서 아래 명령을 실행한다.

```bash
python3 -m venv .venv
```

`.venv` 폴더가 생성된다. 이 폴더는 Git에 올리지 않는다 (.gitignore에 이미 포함).

### 5-2. venv 활성화

```bash
source .venv/bin/activate
```

### 5-3. 활성화 확인

활성화되면 터미널 앞에 `(.venv)` 표시가 나타난다.

```
(.venv) username@MacBook init %
```

추가로 아래 명령으로 Python 경로가 `.venv` 안을 가리키는지 확인한다.

```bash
which python
```

출력 결과가 `.venv/bin/python` 경로를 가리키면 정상이다.

> **참고:** venv가 활성화된 상태에서는 `python3` 대신 `python`, `pip3` 대신 `pip` 명령을 사용해도 .venv 안의 Python이 실행된다.

### 5-4. venv 비활성화 (작업 종료 시)

```bash
deactivate
```

---

## Step 6. 라이브러리 설치

### 6-1. pip 업그레이드 (선행)

```bash
pip install --upgrade pip
```

### 6-2. 본인 담당 모듈에 맞는 라이브러리 설치

**담당자 A (전처리 + 인프라):**
```bash
pip install -r requirements/preprocessing.txt
pip install -r requirements/dev.txt
```

**담당자 B (규칙 기반 분석):**
```bash
pip install -r requirements/rule_analysis.txt
pip install -r requirements/dev.txt
```

**담당자 C (LLM 분석):**
```bash
pip install -r requirements/llm_analysis.txt
pip install -r requirements/dev.txt
```

**담당자 D (리포트 + UI):**
```bash
pip install -r requirements/report_ui.txt
pip install -r requirements/dev.txt
```

### 6-3. 설치 확인

```bash
pip list
```

설치된 패키지 목록이 출력되면 정상이다.

---

## Step 7. 환경변수 설정 (.env)

### 7-1. .env 파일 생성

```bash
cp .env.example .env
```

### 7-2. .env 파일 편집

```bash
nano .env
```

또는 VS Code로 열어도 된다.

```bash
code .env
```

아래 내용을 본인의 API 키로 채운다.

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

nano 에디터에서는 `Ctrl + O` → Enter로 저장, `Ctrl + X`로 나간다.

> **주의:** `.env` 파일은 절대 Git에 올리지 않는다. `.gitignore`에 이미 포함되어 있지만, 실수로 `git add .`를 하지 않도록 주의한다.

---

## Step 8. 환경 검증

### 8-1. 검증 스크립트 실행

```bash
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

```bash
pytest tests/ -v
```

기존 테스트가 통과하면 개발을 시작할 준비가 된 것이다.

---

## Step 9. 일상 작업 흐름

매일 작업을 시작할 때 아래 순서를 따른다.

### 9-1. 터미널을 열고 프로젝트 폴더로 이동

```bash
cd ~/Documents/init
```

### 9-2. venv 활성화

```bash
source .venv/bin/activate
```

### 9-3. 최신 코드 받기

```bash
git checkout develop
git pull origin develop
```

### 9-4. 자기 브랜치로 이동 (또는 새 브랜치 생성)

```bash
git checkout feature/a-preprocessing
```

또는 새 브랜치를 만들 때:

```bash
git checkout -b feature/a-새기능이름
```

### 9-5. requirements 변경 확인

다른 팀원이 requirements 파일을 수정했다면 재설치한다.

```bash
pip install -r requirements/base.txt
pip install -r requirements/본인모듈.txt
```

### 9-6. 작업 후 커밋 및 푸시

```bash
git add .
git commit -m "feat: 반복 표현 검출 로직 구현"
git push origin feature/a-preprocessing
```

### 9-7. 작업 종료 시

```bash
deactivate
```

---

## 자주 발생하는 문제 해결

### "python3: command not found"

Homebrew로 설치한 Python이 PATH에 연결되지 않은 경우다. 아래 명령으로 확인한다.

```bash
brew link python@3.12
```

그래도 안 되면 `.zshrc`에 직접 경로를 추가한다.

```bash
echo 'export PATH="$(brew --prefix python@3.12)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### KoNLPy import 시 "No JVM shared library file" 오류

JAVA_HOME이 설정되지 않았거나 경로가 잘못된 경우다. 아래 명령으로 확인한다.

```bash
echo $JAVA_HOME
ls $JAVA_HOME
```

경로가 비어 있으면 Step 2-3의 환경변수 설정을 다시 수행한다. Apple Silicon Mac에서는 Homebrew 경로가 `/opt/homebrew/`인 반면, Intel Mac에서는 `/usr/local/`이므로 주의한다.

### pip install 시 "error: externally-managed-environment"

macOS Sonoma 이후에서 시스템 Python에 직접 패키지를 설치하려 할 때 발생한다. venv 가 활성화된 상태인지 확인한다. 터미널 앞에 `(.venv)`가 보여야 한다. 보이지 않으면 `source .venv/bin/activate`를 먼저 실행한다.

### Apple Silicon에서 특정 패키지 설치 실패

M1/M2/M3 Mac에서 일부 패키지(numpy, scipy 등)가 빌드에 실패할 수 있다. 이 경우 Rosetta를 통해 x86 모드로 설치하거나, 패키지를 최신 버전으로 업그레이드하면 대부분 해결된다.

```bash
pip install --upgrade numpy
```

그래도 안 되면 Miniforge(arm64 네이티브 conda)를 고려할 수 있지만, 이 프로젝트에서는 대부분의 패키지가 Apple Silicon을 지원하므로 드문 경우다.

### git push 시 인증 오류

GitHub에서 비밀번호 인증이 차단되어 있다. SSH 키를 등록하는 것을 권장한다.

```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "본인 이메일"

# 키 복사
pbcopy < ~/.ssh/id_ed25519.pub
```

복사된 키를 GitHub > Settings > SSH and GPG keys > New SSH key에 붙여넣는다. 이후 클론 URL을 SSH 형식으로 변경한다.

```bash
git remote set-url origin git@github.com:nlp-ai-report-generation/init.git
```

