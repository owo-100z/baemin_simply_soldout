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

  // const button = document.createElement('button');
  // button.textContent = '테스트 버튼';
  // button.onclick = async function() {
  //     // 테스트 버튼 클릭 시 동작
  //     let result = await soldoutOption([]); //테스트
  //     //console.log('테스트 결과:', result);
  // };

  // 항목 리스트 생성
  const itemList = document.createElement('ul');
  itemList.classList.add('item-list');

  // 항목 데이터 배열
  const items = [...products];
  console.log('품절처리할 상품 목록:', items);

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
  // popup.appendChild(button);
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
const searchContents = async (name) => {
  menuSearch = true;
  if (baemin) {
    // 배민 API를 통해 품절처리하도록 수정
    const menuIdList = ConstanceMenuList[name] || [];
    const optionIdList = ConstanceOptionList[name] || [];
    if (menuIdList.length > 0) {
      //console.log('품절처리할 메뉴 ID:', menuIdList);
      await soldoutMenu(menuIdList).then(result => {
        //console.log('품절처리 결과:', result);
      }
      ).catch(error => {
        //console.error('품절처리 실패:', error);
      });
    }
    if (optionIdList.length > 0) {
      //console.log('품절처리할 옵션 ID:', optionIdList);
      await soldoutOption(optionIdList).then(result => {
        //console.log('품절처리 결과:', result);
      }
      ).catch(error => {
        //console.error('품절처리 실패:', error);
      });
    }

    alert(`품절해제 완료: ${name}`);

    // // 품절버튼이 활성화 되어있는 경우는 일단 새로고침
    // if (location.href.indexOf('soldout') > -1) {
    //   let reload = 'https://self.baemin.com/menu';
    //   if (location.href.indexOf('tab=option') > -1) {
    //     reload = 'https://self.baemin.com/menu?tab=option';
    //   }
    //   location.href = reload;
    //   return;
    // }

    // document.querySelector('div[class^=menuPanel-module] input, div[class^=optionPanel-module] input').value = name;
    // document.querySelector('div[class^=menuPanel-module] input, div[class^=optionPanel-module] input').dispatchEvent(new Event('input', {
    //   bubbles: true,
    //   cancelable: true
    // }));
    // document.querySelector('button[aria-label=검색]').click();
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
  const menu = document.querySelector('p.LNBItem-module__zQ_w');                      // 선택된 메뉴
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
        //console.log('menu_name:', menu_name);
  
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
  // if (location.href.indexOf('soldout') > -1) {
  //   let reload = 'https://self.baemin.com/menu';
  //   if (location.href.indexOf('tab=option') > -1) {
  //     reload = 'https://self.baemin.com/menu?tab=option';
  //   }
  //   location.href = reload;
  // }
  //observer.observe(targetNode, config);
  setTimeout(() => {
    showPopup();
  }, 10);
} else {
  observer.observe(cpTargetNode, config);
}

// ======================================================

// 배민 헤더 세팅
const headers = {
  baemin: {
    'Content-Type': 'application/json',
    'service-channel': 'SELF_SERVICE_PC',
  },
  coupang: {
    'Content-Type': 'application/json',
  },
}

let shopInfo = {};

const ConstanceMenuList = {
  '다리': [1010233388, 1010233389],
  '윙봉': [1010233419, 1010233390, 1010233389],
  '순살': [1010233393, 1010233405],
}

const ConstanceOptionList = {
  '다리': [2344274865, 2344274867, 2351531904, 2344274841, 2344274843, 2344274822],
  '윙봉': [2344274866, 2344274867, 2351531905, 2344274842, 2344274843, 2344274821],
  '순살': [2344274864, 2344274862, 2344274840, 2344274820],
  '뼈': [2344274863, 2344274861, 2344274839, 2344274819]
}

// URL 모음 S ====================
const OWNER_INFO_URL = 'https://self-api.baemin.com/v1/session/profile';
const SHOP_INFO_URL = 'https://self-api.baemin.com/v4/store/shops/search';
const OWNER_URL_V1 = 'https://self-api.baemin.com/v1/menu-sys/core/v1/shop-owners/';
const OWNER_URL_V2 = 'https://self-api.baemin.com/v1/menu-sys/core/v2/shop-owners/';
const GET_MENU_LIST_URL = '/menus/one-shop';
const SOLDOUT_MENU_URL = '/status/menus/soldout';
const ACTIVE_MENU_URL = '/status/menus/active';
const GET_OPTION_GROUP_URL = '/option-groups';
const SOLDOUT_OPTION_URL = '/status/options/soldout';
const ACTIVE_OPTION_URL = '/status/options/active';
// URL 모음 E ====================

// 쿠키조회
const getCookies = () => {
  return document.cookie.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=');
    try {
      acc[name] = JSON.parse(value); // JSON이면 파싱
    } catch {
      // 아니면 그대로 저장
      acc[name] = value;
    }
    return acc;
  }, {});
}

// URL 파라미터 생성 함수
const makeGetParams = (params) => {
  return '?' + Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
}

// API 호출 함수
const ApiCall = async (url, method = 'GET', body = null) => {
  try {
    const options = {
      method: method,
      credentials: 'include',
      headers: headers.baemin,
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    //console.error('API Call Error:', error);
  }
}

const getOwnerInfo = async () => {
  try {
    const url = OWNER_INFO_URL;
    const data = await ApiCall(url);
    shopInfo.owner = data;
  } catch (error) {
    //console.error('Failed to fetch owner info:', error);
  }
}

const getShopInfo = async () => {
  if (!shopInfo.owner) {
    await getOwnerInfo();
  }
  if (!shopInfo.owner) {
    //console.error('Owner info is not available.');
    return;
  }
  if (!shopInfo.owner.shopOwnerNumber) {
    //console.error('Shop owner number is not available.');
    return;
  }

  const params = {
    shopOwnerNo: shopInfo.owner.shopOwnerNumber,
  };

  try {
    const url = SHOP_INFO_URL + makeGetParams(params);
    const data = await ApiCall(url);
    shopInfo.shops = data;
  } catch (error) {
    //console.error('Failed to fetch shop info:', error);
  }
}

const getOptions = async (page = 1, optionName = '') => {
  if (!shopInfo.owner || !shopInfo.shops) {
    //console.error('Owner or shop info is not available.');
    return;
  }
  const shop = shopInfo.shops?.content?.at(0);
  if (!shop) {
    //console.error('Shop information is not available.');
    return;
  }
  const params = {
    optionName: optionName,
    page: optionName ? 0 : page,
    size: 20,
  };
  const OWNER_OPTION_GROUP_URL = OWNER_URL_V1 + shopInfo.owner.shopOwnerNumber + GET_OPTION_GROUP_URL;
  try {
    const url = OWNER_OPTION_GROUP_URL + makeGetParams(params);
    const data = await ApiCall(url);
    //console.log('Fetched options:', data?.data?.content);
    return data?.data?.content?.reduce((acc, group) => {
      if (group.options && group.options.length > 0) {
        group.options.forEach(option => {
          acc.push({
            ...option,
            groupName: group.name,
            groupId: group.id,
          });
        });
      }
      return acc;
    }
    , []) || [];
  } catch (error) {
    //console.error('Failed to fetch options:', error);
  }
}

const getMenuList = async (page = 1, menuName = '') => {
  if (!shopInfo.owner || !shopInfo.shops) {
    //console.error('Owner or shop info is not available.');
    return;
  }

  const shop = shopInfo.shops?.content?.at(0);
  if (!shop) {
    //console.error('Shop information is not available.');
    return;
  }

  const params = {
    shopId: shop.shopNo,
    menuName: menuName,
    page: menuName ? 0 : page,
    size: 20,
  };

  const OWNER_MENU_LIST_URL = OWNER_URL_V2 + shopInfo.owner.shopOwnerNumber + GET_MENU_LIST_URL;

  try {
    const url = OWNER_MENU_LIST_URL + makeGetParams(params);
    const data = await ApiCall(url);
    return data?.data?.content || [];
  } catch (error) {
    //console.error('Failed to fetch menu list:', error);
  }
}

const soldoutMenu = async (menuIds) => {
  if (!shopInfo.owner || !shopInfo.shops) {
    //console.error('Owner or shop info is not available.');
    return;
  }

  const shop = shopInfo.shops?.content?.at(0);
  if (!shop) {
    //console.error('Shop information is not available.');
    return;
  }

  if (!Array.isArray(menuIds) || menuIds.length === 0) {
    //console.error('Menu IDs must be a non-empty array.');
    return;
  }

  const params = {
    menuIds: menuIds,
    restockedAt: null, // 입력된 일시까지 품절 처리
  };

  const OWNER_SOLDOUT_MENU_URL = OWNER_URL_V2 + shopInfo.owner.shopOwnerNumber + SOLDOUT_MENU_URL;

  try {
    const url = OWNER_SOLDOUT_MENU_URL;
    const data = await ApiCall(url, 'PUT', params);
    return data;
  } catch (error) {
    //console.error('Failed to soldout menu:', error);
  }
}

const activeMenu = async (menuIds) => {
  if (!shopInfo.owner || !shopInfo.shops) {
    //console.error('Owner or shop info is not available.');
    return;
  }

  const shop = shopInfo.shops?.content?.at(0);
  if (!shop) {
    //console.error('Shop information is not available.');
    return;
  }

  if (!Array.isArray(menuIds) || menuIds.length === 0) {
    //console.error('Menu IDs must be a non-empty array.');
    return;
  }

  const params = {
    menuIds: menuIds,
  };

  const OWNER_ACTIVE_MENU_URL = OWNER_URL_V2 + shopInfo.owner.shopOwnerNumber + ACTIVE_MENU_URL;

  try {
    const url = OWNER_ACTIVE_MENU_URL;
    const data = await ApiCall(url, 'PUT', params);
    return data;
  } catch (error) {
    //console.error('Failed to activate menu:', error);
  }
}

const soldoutOption = async (optionIds) => {
  if (!shopInfo.owner || !shopInfo.shops) {
    //console.error('Owner or shop info is not available.');
    return;
  }
  const shop = shopInfo.shops?.content?.at(0);
  if (!shop) {
    //console.error('Shop information is not available.');
    return;
  }
  if (!Array.isArray(optionIds) || optionIds.length === 0) {
    //console.error('Option IDs must be a non-empty array.');
    return;
  }
  const params = {
    optionIds: optionIds,
  };
  const OWNER_SOLDOUT_OPTION_URL = OWNER_URL_V2 + shopInfo.owner.shopOwnerNumber + SOLDOUT_OPTION_URL;
  try {
    const url = OWNER_SOLDOUT_OPTION_URL;
    const data = await ApiCall(url, 'PUT', params);
    return data;
  } catch (error) {
    //console.error('Failed to soldout option:', error);
  }
}

const activeOption = async (optionIds) => {
  if (!shopInfo.owner || !shopInfo.shops) {
    //console.error('Owner or shop info is not available.');
    return;
  }
  const shop = shopInfo.shops?.content?.at(0);
  if (!shop) {
    //console.error('Shop information is not available.');
    return;
  }
  if (!Array.isArray(optionIds) || optionIds.length === 0) {
    //console.error('Option IDs must be a non-empty array.');
    return;
  }
  const params = {
    optionIds: optionIds,
  };
  const OWNER_ACTIVE_OPTION_URL = OWNER_URL_V2 + shopInfo.owner.shopOwnerNumber + ACTIVE_OPTION_URL;
  try {
    const url = OWNER_ACTIVE_OPTION_URL;
    const data = await ApiCall(url, 'PUT', params);
    return data;
  } catch (error) {
    //console.error('Failed to activate option:', error);
  }
}

const getAllMenus = async () => {
  if (!shopInfo.owner || !shopInfo.shops) {
    //console.error('Owner or shop info is not available.');
    return;
  }

  const shop = shopInfo.shops?.content?.at(0);
  if (!shop) {
    //console.error('Shop information is not available.');
    return;
  }

  const params = {
    shopId: shop.shopNo,
    page: 1,
    size: 20,
  };

  const OWNER_MENU_LIST_URL = OWNER_URL_V2 + shopInfo.owner.shopOwnerNumber + GET_MENU_LIST_URL;

  let menus = [];

  while (true) {
    try {
      const url = OWNER_MENU_LIST_URL + makeGetParams(params);
      const data = await ApiCall(url);
      
      if (!data || !data.data || !data.data.content) {
        //console.error('No menu data found.');
        return;
      }

      // 메뉴 데이터 처리
      //console.log('Fetched menus:', data.data.content);

      menus = menus.concat(data.data.content);

      // 다음 페이지로 이동
      if (data.data.last) {
        break; // 마지막 페이지면 종료
      }
      params.page++;
    } catch (error) {
      //console.error('Failed to fetch menus:', error);
      break;
    }
  }

  return menus;
}

const getAllOptions = async () => {
  if (!shopInfo.owner || !shopInfo.shops) {
    //console.error('Owner or shop info is not available.');
    return;
  }

  const shop = shopInfo.shops?.content?.at(0);
  if (!shop) {
    //console.error('Shop information is not available.');
    return;
  }

  const params = {
    page: 0,
    size: 20,
  };

  const OWNER_OPTION_GROUP_URL = OWNER_URL_V1 + shopInfo.owner.shopOwnerNumber + GET_OPTION_GROUP_URL;

  let options = [];

  while (true) {
    try {
      const url = OWNER_OPTION_GROUP_URL + makeGetParams(params);
      const data = await ApiCall(url);
      
      if (!data || !data.data || !data.data.content) {
        //console.error('No option data found.');
        return;
      }

      // 옵션 데이터 처리
      //console.log('Fetched options:', data.data.content);
      options = options.concat(data.data.content?.reduce((acc, group) => {
        if (group.options && group.options.length > 0) {
          group.options.forEach(option => {
            acc.push({
              ...option,
              groupName: group.name,
              groupId: group.id,
            });
          });
        }
        return acc;
      }, []));

      // 다음 페이지로 이동
      if (data.data.last) {
        break; // 마지막 페이지면 종료
      }
      params.page++;
    } catch (error) {
      //console.error('Failed to fetch options:', error);
      break;
    }
  }

  return options;
}

// 초기화 함수 호출
getShopInfo().then(() => {
  //console.log('Shop Info:', shopInfo);

  // 초기 메뉴 리스트 가져오기
  getAllMenus().then((menus) => {
    //console.log('All Menus:', menus);
  }).catch(error => {
    //console.error('Error fetching all menus:', error);
  });

  // 초기 옵션 리스트 가져오기
  getAllOptions().then((options) => {
    //console.log('All Options:', options);
  }).catch(error => {
    //console.error('Error fetching all options:', error);
  });
}).catch(error => {
  //console.error('Error fetching shop info:', error);
});