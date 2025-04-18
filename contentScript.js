const baemin = location.href.indexOf('self.baemin.com') > -1;

let products = [];

chrome.storage.local.get({ items: [] }, function(result) {
  products = result.items;
});


const showPopup = () => {
  // 팝업 컨테이너 생성
  const popup = document.createElement('div');
  popup.classList.add('soldout-popup');

  // 닫기 버튼 생성
  const closeButton = document.createElement('button');
  closeButton.classList.add('close');
  closeButton.innerHTML = '&times;'; // 'X' 문자
  closeButton.onclick = function() {
      document.body.removeChild(popup);
  };

  // 제목 생성
  const title = document.createElement('h3');
  title.textContent = '품절 처리할 상품 선택';

  // 항목 리스트 생성
  const itemList = document.createElement('ul');
  itemList.classList.add('item-list');

  // 항목 데이터 배열
  const items = [...products];

  // 각 항목에 대한 요소 생성 및 추가
  items.forEach(item => {
    const listItem = document.createElement('li');
    listItem.classList.add('item');

    const itemSpan = document.createElement('span');
    itemSpan.textContent = item;

    listItem.appendChild(itemSpan);
    itemList.appendChild(listItem);

    // 항목 클릭 이벤트 추가
    listItem.onclick = function() {
      searchContents(item);
      ischk = false;
      soldoutClick = false;
    };
  });

  // 팝업에 요소 추가
  popup.appendChild(closeButton);
  popup.appendChild(title);
  popup.appendChild(itemList);

  // 팝업을 body에 추가
  document.body.appendChild(popup);

  // 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
      .soldout-popup {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 20px;
          background-color: white;
          border: 1px solid #ccc;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          z-index: 10000;
          width: 300px;
          box-sizing: border-box;
      }
      .close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 20px;
          height: 20px;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
      }
      .item-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 0;
          margin: 0;
          list-style: none;
      }
      .item {
          position: relative;
          width: calc(50% - 10px);
          padding-bottom: calc(50% - 10px);
          background-color: #f0f0f0;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-sizing: border-box;
          border: 1px solid #ccc;
      }
      .item span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 30px;
          text-align: center;
      }
  `;
  document.head.appendChild(style);
}

let menuSearch = false; // 메뉴검색여부
let ischk = false;
let soldoutClick = false;

// 1. 상품 검색
const searchContents = (name) => {
  menuSearch = true;
  if (baemin) {
    // 품절버튼이 활성화 되어있는 경우는 일단 새로고침
    if (location.href.indexOf('soldout') > -1) {
      let reload = 'https://self.baemin.com/menu';
      if (location.href.indexOf('tab=option') > -1) {
        reload = 'https://self.baemin.com/menu?tab=option';
      }
      location.href = reload;
      return;
    }

    document.querySelector('div[class^=menuPanel-module] input, div[class^=optionPanel-module] input').value = name;
    document.querySelector('div[class^=menuPanel-module] input, div[class^=optionPanel-module] input').dispatchEvent(new Event('input', {
      bubbles: true,
      cancelable: true
    }));
    document.querySelector('button[aria-label=검색]').click();
  } else {
    const menulist = Array.from(document.querySelectorAll('input[type=checkbox][id^=sub_checkbox]')).map(t => t.closest('div.css-wuuhxc').querySelector('div[class*=sub_title] span'));
    menulist.filter(t => t.textContent.indexOf(name) > -1).map(t => t.closest('div.css-wuuhxc').querySelector('input[type=checkbox]')).map(t => t.click());
  }
}

// 2. 품절버튼 클릭
const soldoutBtnClick = () => {
  const btn = document.querySelectorAll('div[class^=actionPart]')[0].querySelectorAll('button')[0];

  btn.click();
}

// 3. 체크박스 클릭
const selectProducts = () => {
  const chklist = Array.from(document.querySelectorAll('div[class^=menuPanel] input[type=checkbox], div[class^=optionPanel] input[type=checkbox]')).filter(t => !t.disabled);

  for(let chk of chklist) {
    if(!chk.checked) {
      setTimeout(() => {
        chk.click();
      }, 10);
    }
  }

  setTimeout(() => {
    if (Array.from(chklist).filter(t => t.checked).length === chklist.length) {
      ischk = true;
      //console.log('check click finish');
      soldoutProc();
    }
  }, 10);
}

// 4. 품절하기
const soldoutProc = async () => {
  const isAtBottom = await performScroll();

  const chklist = Array.from(document.querySelectorAll('div[class^=menuPanel] input[type=checkbox], div[class^=optionPanel] input[type=checkbox]')).filter(t => !t.disabled);
  if (chklist.length > 0 && chklist.filter(t => t.checked).length === chklist.length) {
    menuSearch = false;
    const btn = Array.from(document.querySelectorAll('div[class^=menuPanel] button span, div[class^=optionPanel] button span')).filter(t => t.textContent === '품절하기')[0].closest('button');
    if (btn) btn.click();

    let reload = 'https://self.baemin.com/menu';
    if (location.href.indexOf('tab=option') > -1) {
      reload = 'https://self.baemin.com/menu?tab=option';
    }
    setTimeout(() => { location.href = reload; }, 500);
  } else {
    if (isAtBottom) {
      let reload = 'https://self.baemin.com/menu';
      if (location.href.indexOf('tab=option') > -1) {
        reload = 'https://self.baemin.com/menu?tab=option';
      }
      location.href = reload;
    } else {
      selectProducts();
    }
  }
}

// 5. 탭이동
const tabChange = () => {

}

// a. 쿠팡 품절클릭
const cpSoldoutClick = () => {
  const soldoutBtn = Array.from(document.querySelectorAll('div.floating-popup span')).filter(t => t.textContent === '적용').map(t => t.closest('button'));
  if (soldoutBtn.length > 0) {
    //console.log('soldout Click!');
    soldoutBtn[0].click();

    setTimeout(() => { location.reload(); }, 500);
  }
}

// 스크롤
function scrollDownBy(pixels) {
  return new Promise((resolve) => {
      const startY = window.scrollY;
      const targetY = startY + pixels;
      const distance = targetY - startY;
      const duration = 500; // 스크롤 지속 시간 (밀리초)
      const startTime = performance.now();

      function scrollStep(currentTime) {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const easeInOutQuad = progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          window.scrollTo(0, startY + distance * easeInOutQuad);

          if (progress < 1) {
              requestAnimationFrame(scrollStep);
          } else {
              resolve();
          }
      }

      requestAnimationFrame(scrollStep);
  });
}

async function performScroll() {
  const halfViewportHeight = window.innerHeight;
  await scrollDownBy(halfViewportHeight);

  if (isAtBottom()) {
    return true;
  }
}

function isAtBottom() {
  const 보정치 = 10;
  return window.scrollY + window.innerHeight + 보정치 >= document.documentElement.scrollHeight;
}

// 감시할 대상 요소 선택 (예: 메인 콘텐츠 영역)
const targetNode = document.querySelector('div.Frame');
const cpTargetNode = document.querySelector('div#merchant-management');

// 옵션 설정: 자식 노드의 변경과 하위 트리의 변경을 감지
const config = { childList: true, subtree: true, attributes: true };

// 콜백 함수: 변경 사항이 발생하면 호출됨
const callback = function(mutationsList) {
  //console.log(mutationsList);
  /* ==============================배민============================== */
  const menu = document.querySelector('p.MenuItem-module__U26g');                     // 선택된 메뉴
  const popup = document.querySelector('div.soldout-popup');                          // 품절 팝업
  const tab = document.querySelector('div[role=tablist]');                            // 메뉴옵션관리의 탭
  const btnArea = document.querySelectorAll('div[class^=actionPart]');                // 버튼영역
  const menuPanel = document.querySelectorAll('div[class^=menuPanel-module]');        // 메뉴패널
  const optnPanel = document.querySelectorAll('div[class^=optionPanel-module]');      // 옵션패널
  const textInput = document.querySelector('div[class^=menuPanel-module] input, div[class^=optionPanel-module] input');    // 텍스트 입력 영역

  // 품절 액션버튼
  let soldoutBtn, cancelBtn;
  if (btnArea.length > 0) {
    const spans = btnArea[0].querySelectorAll('span');
    const addMenu = Array.from(spans).find(span => span.textContent.trim() === '메뉴 추가');
    const addOptn = Array.from(spans).find(span => span.textContent.trim() === '메뉴 추가');
    const cancel = Array.from(spans).find(span => span.textContent.trim() === '취소');

    if (addMenu) {
      soldoutBtn = addMenu.closest('button');  // 메뉴버튼
    }
    if (addOptn) {
      soldoutBtn = addOptn.closest('button');  // 옵션버튼
    }
    if (cancel) {
      cancelBtn = cancel.closest('button');  // 취소버튼
    }
  }

  // 메뉴 리스트, 옵션 리스트
  let menuList, optnList;
  if (menuPanel.length > 0) {
    const tmp = menuPanel[0].querySelectorAll('div[class^=menuList-module]');
    if (tmp.length > 0) {
      menuList = tmp[0].firstChild?.firstChild;
    }
  }
  if (optnPanel.length > 0) {
    const tmp = optnPanel[0].querySelectorAll('div[class^=optionList-module]');
    if (tmp.length > 0) {
      optnList = Array.from(tmp[0].firstChild?.firstChild?.childNodes);
    }
  }

  // 체크박스
  let chkbox;
  if (menuPanel.length > 0) {
    chkbox = menuPanel[0].querySelectorAll('input[type=checkbox]');
  }
  if (optnPanel.length > 0) {
    chkbox = optnPanel[0].querySelectorAll('input[type=checkbox]');
  }
  /* ==============================배민============================== */



  /* ==============================쿠팡============================== */
  const cp = {
    menuUl: document.querySelector('ul[class^=nav-side-bar]'),
    menu: document.querySelector('ul[class^=nav-side-bar] li a.active'),
    soldoutPopup: document.querySelector('div.floating-popup'),
  }
  /* ==============================쿠팡============================== */

  const attributesMutations = mutationsList.filter(t => t.type === 'attributes');
  const childListMutations = mutationsList.filter(t => t.type === 'childList');

  // 1. attribute의 변경
  if (attributesMutations.length > 0) {
    if (baemin) {
      // 1-1. menu의 변경
      if (checkTarget(attributesMutations, menu).is) {
        //init();
  
        const menu_name = menu.textContent;
  
        // 메뉴옵션관리 메뉴에 있을 때
        if (menu_name && menu_name === '메뉴·옵션 관리') {
          showPopup();
        }
        // 그 외의 경우
        else {
          // 팝업이 열려있다면 삭제(닫기)
          if (popup) {
            popup.remove();
          }
        }
      }
  
      // 1-2. tab의 변경
      if (checkTarget(attributesMutations, tab).is) {
        //init();
        //console.log(mutationsList);
      }
  
      // 1-4. 취소버튼의 클릭
      if (checkTarget(attributesMutations, soldoutBtn).is) {
        //console.log('취소', mutationsList);
      }
  
      // 1-5. 텍스트 입력필드의 변경
      if (checkTarget(attributesMutations, textInput).is) {
        // 텍스트 입력 이후부터 menuList의 변경을 감지한다
        // 2025.04.15 변경 => 품절할 상품을 클릭했을 때부터 menuList의 변경을 감지함!
        // menuSearch = true;
        //console.log(mutationsList);
      }
    } else {
      // 1-a. menu의 변경
      if (checkTarget(attributesMutations, cp.menu).is) {
        const menu = cp.menu.querySelector('span.title');
        const menu_name = menu?.textContent;
  
        // 품절숨김 메뉴에 있을 때
        if (menu_name && menu_name === '품절 · 숨김') {
          showPopup();
        }
        // 그 외의 경우
        else {
          // 팝업이 열려있다면 삭제(닫기)
          if (popup) {
            popup.remove();
          }
        }
      }

      // 1-b. 품절항목 체크
      if (menuSearch && checkTarget(attributesMutations, cp.soldoutPopup).is) {
        cpSoldoutClick();
      }
    }
  }

  // 2. child list의 변경
  if (childListMutations.length > 0) {
    //console.log(childListMutations);

    if (baemin) {
      // 2-1. menuList의 변경 (화면초기화 이후)
      if (menuSearch && menuList && checkTarget(childListMutations, menuList).is) {
        //console.log('menu', checkTarget(childListMutations, menuList).list);
        soldoutBtnClick();
      }
  
      // 2-2. optnList의 변경 (화면초기화 이후)
      if (menuSearch && optnList && checkTarget(childListMutations, optnList).is) {
        //console.log('option', checkTarget(childListMutations, optnList).list);
        soldoutBtnClick();
      }
  
      // 2-3. 품절버튼의 클릭
      if (menuSearch && !soldoutClick && chkbox && chkbox.length > 0) {
        soldoutClick = true;
        selectProducts();
      }
  
      // 2-4. 찾는메뉴가 없을때
      if (menuSearch && Array.from(document.querySelectorAll('div')).filter(t => t.textContent === '찾는 메뉴가 없어요.').length > 0) {
        soldoutClick = true;
      }
    } else {
      if (checkTarget(childListMutations, cp.menuUl).is) {
        //console.log('새로고침 === ', checkTarget(childListMutations, cp.menuUl));
        if (childListMutations.length > 1) return;

        const menu_name = cp.menu.querySelector('span.title').textContent;
  
        // 품절숨김 메뉴에 있을 때
        if (menu_name && menu_name === '품절 · 숨김') {
          showPopup();
        }
        // 그 외의 경우
        else {
          // 팝업이 열려있다면 삭제(닫기)
          if (popup) {
            popup.remove();
          }
        }
      }
    }
  }
};

const checkTarget = (list, target) => {
  if(!target) return {};

  let rtn;
  let targetArr;
  if (!Array.isArray(target)) {
    targetArr = [...[target]];
  } else {
    targetArr = [...target];
  }

  rtn = list.filter(t => Array.from(targetArr).includes(t.target));

  return {
    list: rtn,
    is: rtn.length > 0
  };
}

// 초기화
const init = () => {
  menuSearch = false;
}

// MutationObserver 생성 및 대상 노드 감시 시작
const observer = new MutationObserver(callback);

if (baemin) {
  // 품절버튼이 활성화 되어있는 경우는 일단 새로고침
  if (location.href.indexOf('soldout') > -1) {
    let reload = 'https://self.baemin.com/menu';
    if (location.href.indexOf('tab=option') > -1) {
      reload = 'https://self.baemin.com/menu?tab=option';
    }
    location.href = reload;
  }
  observer.observe(targetNode, config);
} else {
  observer.observe(cpTargetNode, config);
}