(function() {
  'use strict';
  
  const WIDGET_ID = 'xayo-watchtime-widget';
  const LOADING_ID = 'xayo-loading-indicator';
  const ERROR_ID = 'xayo-error-widget';
  
  let isFetching = false;
  
  let lastFetchedUsername = null;
  
  const DEFAULT_POSITION = {
    top: '30%',
    right: '20px'
  };
  
  let widgetPosition = Object.assign({}, DEFAULT_POSITION);
  
  function removeWidget() {
    const existingWidget = document.getElementById(WIDGET_ID);
    if (existingWidget) {
      existingWidget.remove();
    }
  }
  
  function removeErrorWidget() {
    const existingErrorWidget = document.getElementById(ERROR_ID);
    if (existingErrorWidget) {
      existingErrorWidget.remove();
    }
  }
  
  async function fetchWatchtimeData(username) {
    try {
      const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://xayo.pl/api/mostWatched/${username}`)}`;
      
      const response = await fetch(corsProxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return JSON.parse(data.contents);
    } catch (error) {
      return [];
    }
  }
  
  function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;
    
    element.style.cursor = 'move';
    
    element.addEventListener('mousedown', function(e) {
      isDragging = true;
      
      const rect = element.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      
      element.style.opacity = '0.8';
      element.style.transition = 'none';
      
      e.preventDefault();
    });
    
    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        element.style.opacity = '1';
        element.style.transition = 'opacity 0.3s';
        
        const rect = element.getBoundingClientRect();
        
        if (rect.right > window.innerWidth - 20) {
          widgetPosition.right = `${window.innerWidth - rect.right}px`;
          element.style.right = widgetPosition.right;
          element.style.left = 'auto';
        } else {
          widgetPosition.right = 'auto';
          widgetPosition.left = `${rect.left}px`;
          element.style.left = widgetPosition.left;
          element.style.right = 'auto';
        }
        
        widgetPosition.top = `${rect.top}px`;
        element.style.top = widgetPosition.top;
      }
    });
    
    document.addEventListener('mousemove', function(e) {
      if (isDragging) {
        const left = e.clientX - offsetX;
        const top = e.clientY - offsetY;
        
        element.style.left = `${left}px`;
        element.style.right = 'auto';
        element.style.top = `${top}px`;
      }
    });
    
    return element;
  }
  
  function displayTop5Streamers(data, username) {
    removeWidget();
    removeErrorWidget();
    
    if (!data || data.length === 0) {
      return;
    }
    
    const widget = document.createElement('div');
    widget.id = WIDGET_ID;
    
    widget.style.position = 'fixed';
    widget.style.zIndex = '9999';
    widget.style.backgroundColor = 'rgba(100, 65, 164, 0.15)';
    widget.style.color = 'white';
    widget.style.padding = '15px';
    widget.style.borderRadius = '6px';
    widget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    widget.style.fontFamily = 'Inter, Arial, sans-serif';
    widget.style.minWidth = '240px';
    widget.style.backdropFilter = 'blur(5px)';
    widget.style.border = '1px solid rgba(138, 90, 200, 0.6)';
    
    if (widgetPosition.right && widgetPosition.right !== 'auto') {
      widget.style.right = widgetPosition.right;
      widget.style.left = 'auto';
    } else if (widgetPosition.left) {
      widget.style.left = widgetPosition.left;
      widget.style.right = 'auto';
    } else {
      widget.style.right = DEFAULT_POSITION.right;
      widget.style.left = 'auto';
    }
    
    widget.style.top = widgetPosition.top || DEFAULT_POSITION.top;
    
    const headerContainer = document.createElement('div');
    headerContainer.style.display = 'flex';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.justifyContent = 'center';
    headerContainer.style.borderBottom = '1px solid rgba(138, 90, 200, 0.6)';
    headerContainer.style.paddingBottom = '5px';
    headerContainer.style.marginBottom = '8px';
    headerContainer.style.height = '24px';
    headerContainer.style.paddingTop = '2px';
    
    widget.style.paddingTop = '10px';
    
    const header = document.createElement('h3');
    header.textContent = `Top 5 WatchTime: ${username}`;
    header.style.marginTop = '-6px';
    header.style.fontSize = '16px';
    header.style.textAlign = 'center';
    header.style.lineHeight = '24px';
    
    headerContainer.appendChild(header);
    widget.appendChild(headerContainer);
    
    const list = document.createElement('ul');
    list.style.padding = '0';
    list.style.margin = '0';
    list.style.listStyle = 'none';
    
    const top5 = data.slice(0, 5);
    
    const trophies = {
      0: '🏆',
      1: '🥈',
      2: '🥉'
    };
    
    top5.forEach((streamer, index) => {
      const item = document.createElement('li');
      item.style.padding = '3px 0';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.height = '22px';
      
      const totalMinutes = streamer.count;
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;
      
      const streamerNameContainer = document.createElement('span');
      streamerNameContainer.style.display = 'flex';
      streamerNameContainer.style.alignItems = 'center';
      
      const rankAndName = document.createElement('span');
      rankAndName.textContent = `${index + 1}. ${streamer.streamer}`;
      rankAndName.style.fontWeight = 'normal';
      rankAndName.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
      
      streamerNameContainer.appendChild(rankAndName);
      
      if (index < 3) {
        const trophySpan = document.createElement('span');
        trophySpan.textContent = trophies[index];
        trophySpan.style.marginLeft = '5px';
        streamerNameContainer.appendChild(trophySpan);
      }
      
      const watchtime = document.createElement('span');
      
      let watchtimeText = '';
      
      if (days > 0) {
        watchtimeText += `${days}d `;
      }
      
      if (hours > 0 || days > 0) {
        watchtimeText += `${hours}h `;
      }
      
      watchtimeText += `${minutes}m`;
      
      watchtime.textContent = watchtimeText;
      watchtime.style.marginLeft = '10px';
      watchtime.style.opacity = '0.9';
      watchtime.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
      
      item.appendChild(streamerNameContainer);
      item.appendChild(watchtime);
      list.appendChild(item);
    });
    
    widget.appendChild(list);
    
    const bottomSeparator = document.createElement('div');
    bottomSeparator.style.borderBottom = '1px solid rgba(138, 90, 200, 0.6)';
    bottomSeparator.style.margin = '8px 0 5px 0';
    widget.appendChild(bottomSeparator);
    
    const authorInfo = document.createElement('div');
    authorInfo.style.fontSize = '11px';
    authorInfo.style.textAlign = 'left';
    authorInfo.style.opacity = '0.8';
    authorInfo.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    authorInfo.style.marginBottom = '3px';
    authorInfo.style.marginTop = '10px';
    authorInfo.style.lineHeight = '1';
    authorInfo.textContent = 'made by @szhxk2 on X';
    
    widget.style.paddingBottom = '6px';
    
    widget.appendChild(authorInfo);
    
    document.body.appendChild(widget);
    
    makeDraggable(widget);
  }
  
  function showLoadingIndicator() {
    hideLoadingIndicator();
    
    const loadingWidget = document.createElement('div');
    loadingWidget.id = LOADING_ID;
    loadingWidget.style.position = 'fixed';
    loadingWidget.style.zIndex = '9998';
    loadingWidget.style.backgroundColor = 'rgba(100, 65, 164, 0.3)';
    loadingWidget.style.backdropFilter = 'blur(5px)';
    loadingWidget.style.color = 'white';
    loadingWidget.style.padding = '10px';
    loadingWidget.style.borderRadius = '8px';
    loadingWidget.style.border = '1px solid rgba(138, 90, 200, 0.6)';
    loadingWidget.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    loadingWidget.textContent = 'Ładowanie danych...';
    
    if (widgetPosition.right && widgetPosition.right !== 'auto') {
      loadingWidget.style.right = widgetPosition.right;
      loadingWidget.style.left = 'auto';
    } else if (widgetPosition.left) {
      loadingWidget.style.left = widgetPosition.left;
      loadingWidget.style.right = 'auto';
    } else {
      loadingWidget.style.right = DEFAULT_POSITION.right;
      loadingWidget.style.left = 'auto';
    }
    
    loadingWidget.style.top = widgetPosition.top || DEFAULT_POSITION.top;
    
    document.body.appendChild(loadingWidget);
  }
  
  function hideLoadingIndicator() {
    const existingLoader = document.getElementById(LOADING_ID);
    if (existingLoader) {
      existingLoader.remove();
    }
  }
  
  function showErrorMessage(errorMsg) {
    removeWidget();
    
    hideLoadingIndicator();
    
    removeErrorWidget();
    
    const errorWidget = document.createElement('div');
    errorWidget.id = ERROR_ID;
    errorWidget.style.position = 'fixed';
    errorWidget.style.zIndex = '9998';
    errorWidget.style.backgroundColor = 'rgba(200, 50, 50, 0.3)';
    errorWidget.style.backdropFilter = 'blur(5px)';
    errorWidget.style.color = 'white';
    errorWidget.style.padding = '10px';
    errorWidget.style.borderRadius = '8px';
    errorWidget.style.border = '1px solid rgba(200, 50, 50, 0.6)';
    errorWidget.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    errorWidget.textContent = 'Błąd: ' + errorMsg;
    
    if (widgetPosition.right && widgetPosition.right !== 'auto') {
      errorWidget.style.right = widgetPosition.right;
      errorWidget.style.left = 'auto';
    } else if (widgetPosition.left) {
      errorWidget.style.left = widgetPosition.left;
      errorWidget.style.right = 'auto';
    } else {
      errorWidget.style.right = DEFAULT_POSITION.right;
      errorWidget.style.left = 'auto';
    }
    
    errorWidget.style.top = widgetPosition.top || DEFAULT_POSITION.top;
    
    document.body.appendChild(errorWidget);
    
    makeDraggable(errorWidget);
  }
  
  function getUsernameFromH5() {
    const h5Element = document.querySelector('h5[title]');
    if (h5Element && h5Element.getAttribute('title')) {
      return h5Element.getAttribute('title');
    }
    return null;
  }
  
  async function checkForUsernameAndFetchData() {
    if (isFetching) {
      return;
    }
    
    const username = getUsernameFromH5();
    
    if (!username) {
      removeWidget();
      removeErrorWidget();
      hideLoadingIndicator();
      lastFetchedUsername = null;
      return;
    }
    
    if (username === lastFetchedUsername) {
      return;
    }
    
    isFetching = true;
    lastFetchedUsername = username;
    
    removeWidget();
    removeErrorWidget();
    
    showLoadingIndicator();
    
    try {
      const watchtimeData = await fetchWatchtimeData(username);
      
      hideLoadingIndicator();
      
      if (watchtimeData && watchtimeData.length > 0) {
        displayTop5Streamers(watchtimeData, username);
      } else {
        showErrorMessage('Brak danych dla tego użytkownika');
      }
    } catch (error) {
      showErrorMessage(error.message || 'Błąd pobierania danych');
    } finally {
      isFetching = false;
    }
  }
  
  function init() {
    widgetPosition = Object.assign({}, DEFAULT_POSITION);
    
    checkForUsernameAndFetchData();
    
    let debounceTimer = null;
    
    const observer = new MutationObserver((mutations) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        checkForUsernameAndFetchData();
      }, 500);
    });
    
    const config = { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['title']
    };
    
    observer.observe(document.body, config);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();