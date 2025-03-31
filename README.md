# 실행방법
1. Local PC에 Git clone
2. chorme://extensions 접속
3. 실행방법
  - 최초실행: [압축해제된 확장 프로그램을 로드합니다] 버튼 클릭
  - 업데이트: 저장된 확장프로그램 [새로고침]버튼 클릭
4. 상품추가
  - 확장프로그램 기본팝업 사용
  - chrome.storage 사용하여 저장/불러오기 기능 사용
  - ![image](https://github.com/user-attachments/assets/0ed87bbf-e495-4977-ab91-b663aa00f03d)

# 구성
- manifest.json
- popup.html
- popup.js
  - 상품추가/삭제
- contentScript.js
  - 메인 실행파일

# 사용기술
- **MutationObserver** 사용하여 화면 변경 감지
