document.addEventListener('DOMContentLoaded', function() {
    const itemList = document.getElementById('itemList');
    const newItemInput = document.getElementById('newItem');
    const addBtn = document.getElementById('addBtn');
  
    // 저장된 상품 목록 불러오기
    chrome.storage.local.get({ items: [] }, function(result) {
      const items = result.items;
      items.forEach(function(item) {
        addItemToUI(item);
      });
    });
  
    // 상품 항목을 UI에 추가하는 함수
    function addItemToUI(item) {
      const li = document.createElement('li');
      li.className = 'item';
      li.textContent = item;
      
      // 삭제 버튼 생성
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '삭제';
      deleteBtn.addEventListener('click', function() {
        li.remove();
        removeItem(item);
      });
      
      li.appendChild(deleteBtn);
      itemList.appendChild(li);
    }
  
    // 상품 항목을 추가하고 저장하는 이벤트 처리
    addBtn.addEventListener('click', function() {
      const item = newItemInput.value.trim();
      if (!item) return;
      addItemToUI(item);
      saveItem(item);
      newItemInput.value = '';
    });
  
    // 엔터 키로도 등록되도록 처리
    newItemInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' && !event.isComposing) {
        event.preventDefault();
        addBtn.click();
      }
    });
  
    // chrome.storage에 상품 항목 저장
    function saveItem(item) {
      chrome.storage.local.get({ items: [] }, function(result) {
        const items = result.items;
        items.push(item);
        chrome.storage.local.set({ items: items });
      });
    }
  
    // chrome.storage에서 상품 항목 삭제
    function removeItem(item) {
      chrome.storage.local.get({ items: [] }, function(result) {
        let items = result.items;
        items = items.filter(i => i !== item);
        chrome.storage.local.set({ items: items });
      });
    }
  });
  