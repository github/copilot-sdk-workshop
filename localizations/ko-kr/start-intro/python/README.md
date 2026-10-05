# SDK 101 시작 프로젝트: Python

[Python 3.11 이상](https://www.python.org/downloads/)과 인증된 Copilot 액세스가 필요합니다.

Windows PowerShell에서 워크숍 리포지토리 루트로 이동한 후 다음을 실행합니다.

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

macOS/Linux에서는 다음을 실행합니다.

```bash
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

이 폴더를 편집기에서 열고(`code .`) [LIVE_DEMO.md](../../../../start-intro/python/LIVE_DEMO.md)의 1막에 나오는
네 가지 번호가 매겨진 수정 단계를 따라 `main.py`를 편집합니다.
Windows에서는 `.\.venv\Scripts\python.exe main.py`를 실행하고,
macOS/Linux에서는 `.venv/bin/python main.py`를 실행합니다. 인터프리터(Interpreter)를 직접 사용하면
활성화 및 실행 정책을 변경하지 않아도 됩니다.

수정하지 않은 엔트리 포인트(Entrypoint)는 의도적으로 완성되지 않은 상태이며, 작동하는 hello world가 아닙니다.
팟캐스트 에이전트를 만들려면 같은 가이드의 2막을 계속 진행합니다.
`github_podcast_tools.py`, `model_selector.py`, `permission_prompt.py`는
편집하지 않고 재사용합니다.

액세스 확인 및 문제 해결 방법은 [사전 점검](../../../../workshop/intro-00-preflight.md)을 참조하고,
API는 [공식 Python SDK API](https://github.com/github/copilot-sdk/tree/main/python)를 참조합니다.
