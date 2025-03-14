
document.addEventListener("DOMContentLoaded", function () {


  
















  // Auto slide desativado
  const autoSlideEnabled = false;

  // Variáveis do CSS
  const avaliationItemWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--item-width'));
  const itemMargin = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--item-margin'));
  const visibleItems = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--visible-items'));
  const transitionDuration = getComputedStyle(document.documentElement).getPropertyValue('--transition-duration');

  // Largura total de cada item
  const totalAvaliationItemWidth = avaliationItemWidth + itemMargin;

  // Os itens originais já estão no HTML
  const originalItems = Array.from(document.querySelectorAll('.carousel-item'));
  const numOriginalItems = originalItems.length;
  const clonesCount = visibleItems;

  // Índice inicial (após os clones à esquerda)
  let avaliationCurrentIndex = clonesCount;
  const track = document.getElementById('carouselTrack');
  const carouselContainer = document.querySelector('.carousel-container');

  /**
   * Função de easing (easeInOutQuad)
   */
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Anima o scroll do elemento para o alvo durante 0.5s
   */
  function smoothScrollTo(element, target, duration = 500) {
    const start = element.scrollTop;
    const change = target - start;
    const startTime = performance.now();
    function animateScroll(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.scrollTop = start + change * easeInOutQuad(progress);
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }
    requestAnimationFrame(animateScroll);
  }

  /**
   * Reaplica o truncamento para recolher o comentário.
   */
  function truncateComment(commentWrapper) {
    const commentContent = commentWrapper.querySelector('.comment-content');
    const fullText = commentContent.dataset.fullText;
    if (commentContent.scrollHeight <= commentWrapper.clientHeight) return;
    
    let low = 0, high = fullText.length, best = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      let candidate;
      if (mid > 13) {
        let sub = fullText.substring(0, mid - 13);
        // Remove espaço final se houver
        sub = sub.replace(/\s+$/, "");
        candidate = sub + '<span class="read-more">... Leia mais</span><br>';
      } else {
        candidate = fullText.substring(0, mid) + '<span class="read-more">... Leia mais</span><br>';
      }
      commentContent.innerHTML = candidate;
      if (commentContent.scrollHeight <= commentWrapper.clientHeight) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    
    let finalText;
    if (best > 13) {
      let sub = fullText.substring(0, best - 13);
      sub = sub.replace(/\s+$/, "");
      finalText = sub + '<span class="read-more">... Leia mais</span><br>';
    } else {
      finalText = fullText.substring(0, best) + '<span class="read-more">... Leia mais</span><br>';
    }
    commentContent.innerHTML = finalText;
    
    const readMoreLink = commentContent.querySelector('.read-more');
    if (readMoreLink) {
      // Clique para expandir o comentário
      const expandHandler = function() {
        commentContent.innerHTML = fullText;
        commentWrapper.classList.add('expanded');
        commentContent.style.overflowY = 'auto';
        smoothScrollTo(commentContent, commentContent.scrollTop + 40, 500);
      };
      readMoreLink.addEventListener('click', expandHandler);
      // Se o usuário rolar manualmente, expande automaticamente
      commentContent.addEventListener('wheel', function(e) {
        if (e.deltaY > 0 && !commentWrapper.classList.contains('expanded')) {
          expandHandler();
        }
      }, { once: true });
    }
  }

  /**
   * Inicializa o carrossel clonando os itens para início e fim para o efeito infinito.
   */
  function initializeCarousel() {
    originalItems.slice(0, clonesCount).forEach(item => {
      const clone = item.cloneNode(true);
      track.appendChild(clone);
    });
    originalItems.slice(-clonesCount).reverse().forEach(item => {
      const clone = item.cloneNode(true);
      track.insertBefore(clone, track.firstChild);
    });
    track.style.transition = 'none';
    track.style.transform = `translateX(-${avaliationCurrentIndex * totalAvaliationItemWidth}px)`;
    requestAnimationFrame(() => {
      track.style.transition = `transform ${transitionDuration} ease-in-out`;
    });
  }

  initializeCarousel();

  // Aplica o truncamento a todos os comentários após o carregamento
  window.addEventListener('load', () => {
    document.querySelectorAll('.comment-wrapper').forEach(truncateComment);
  });

  /**
   * Colapsa todos os comentários (faz um fade out e depois fade in, reaplicando o truncamento).
   * Essa função é chamada sempre que uma seta de controle é pressionada.
   */
  function collapseAllComments() {
    document.querySelectorAll('.comment-wrapper.expanded').forEach(wrapper => {
      const content = wrapper.querySelector('.comment-content');
      // Inicia o fade out
      content.style.opacity = '0';
      setTimeout(() => {
        wrapper.classList.remove('expanded');
        content.style.overflowY = 'hidden';
        truncateComment(wrapper);
        // Faz o fade in
        content.style.opacity = '1';
      }, 250);
    });
  }

  /**
   * Manipula o carrossel.
   * Sempre que uma seta é pressionada, colapsa os comentários expandidos suavemente.
   */
  let isAnimating = false;
  function goToAvaliationSlide(index) {
    if (isAnimating) return;
    collapseAllComments();
    isAnimating = true;
    track.style.transition = `transform ${transitionDuration} ease-in-out`;
    track.style.transform = `translateX(-${index * totalAvaliationItemWidth}px)`;
    avaliationCurrentIndex = index;
  }

  track.addEventListener('transitionend', () => {
    if (avaliationCurrentIndex >= numOriginalItems + clonesCount) {
      track.style.transition = 'none';
      avaliationCurrentIndex = clonesCount;
      track.style.transform = `translateX(-${avaliationCurrentIndex * totalAvaliationItemWidth}px)`;
    } else if (avaliationCurrentIndex < clonesCount) {
      track.style.transition = 'none';
      avaliationCurrentIndex = numOriginalItems + avaliationCurrentIndex;
      track.style.transform = `translateX(-${avaliationCurrentIndex * totalAvaliationItemWidth}px)`;
    }
    isAnimating = false;
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    goToAvaliationSlide(avaliationCurrentIndex + 1);
  });
  document.getElementById('prevBtn').addEventListener('click', () => {
    goToAvaliationSlide(avaliationCurrentIndex - 1);
  });

  window.addEventListener('resize', collapseAllComments);



























  

  // Menu de Navegação para Media Query 2
  const menuToggle = document.querySelector(".secondary-menu-toggle");
  const secondaryMenu = document.createElement("div");
  secondaryMenu.classList.add("secondary-menu");
  document.body.appendChild(secondaryMenu);

  const menuItems = `
        <ul>
            <li><a href="#inicio" class="active">Tela Inicial</a></li>
            <li><a href="#produtos">Ambientes</a></li>
            <li><a href="#processo">Etapas do processo</a></li>
            <li><a href="#escolher">Por que nos escolher</a></li>
            <li><a href="#avaliacoes">Avaliações</a></li>
            <li><a href="scripts/html/about_us.html">Sobre nós</a></li>
        </ul>
        <div class="secondary-menu-contacts">
          <a href="https://www.instagram.com/cerradoplanejado/" target="_blank" rel="noopener noreferrer">
              <img class="secondary-menu-contacts-icon" src="assets/instagram2.png" alt="Instagram">
            </a>
            <a href="https://wa.me/+5561981002114" target="_blank" rel="noopener noreferrer">
                <img class="secondary-menu-contacts-icon" src="assets/whatsapp2.png" alt="WhatsApp">
            </a>
            <a href="mailto:contato@cerradoplanejado.com.br">
                <img class="secondary-menu-contacts-icon" src="assets/email2.png" alt="E-mail">
            </a>
        </div>
    `;
  secondaryMenu.innerHTML = menuItems;

  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  document.body.appendChild(overlay);

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      secondaryMenu.classList.toggle("active");
      overlay.style.display = "block";
      document.body.classList.add("menu-active");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      secondaryMenu.classList.remove("active");
      overlay.style.display = "none";
      document.body.classList.remove("menu-active");
    });
  }

  const navLinks = document.querySelectorAll(
    ".nav ul li a, .secondary-menu ul li a"
  );

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === "scripts/html/about_us.html") {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        secondaryMenu.classList.remove("active");
        overlay.style.display = "none";
        document.body.classList.remove("menu-active");
        window.location.href = "scripts/html/about_us.html";
      });
    }
  });

  const budgetButton = document.querySelector(".home-budget-button");
  if (budgetButton) {
    budgetButton.addEventListener("click", function () {
      window.location.href = "scripts/html/budget_prev.html";
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const targetId = this.getAttribute("href");
      let offset = 0;

      if (targetId === "#inicio") {
        window.scrollTo(0, 0);
        secondaryMenu.classList.remove("active");
        overlay.style.display = "none";
        document.body.classList.remove("menu-active");
      } else {
        let targetElement;
        if (targetId === "#produtos") {
          targetElement = document.querySelector(".products-main-container");
          offset = -90;
        } else if (targetId === "#processo") {
          targetElement = document.querySelector("#processo .content");
          offset = -80;
        } else if (targetId === "#escolher") {
          targetElement = document.querySelector(".choose-us-card");
          offset = -130;
        } else if (targetId === "#avaliacoes") {
          targetElement = document.querySelector(".avaliations-section");
          offset = -120;
        }

        if (targetElement) {
          const targetPosition =
            targetElement.getBoundingClientRect().top + window.scrollY + offset;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
          secondaryMenu.classList.remove("active");
          overlay.style.display = "none";
          document.body.classList.remove("menu-active");
        }
      }
    });
  });

  const carouselInner = document.querySelector(".home-carousel-inner");
  const carouselItems = document.querySelectorAll(".home-carousel-item");
  let currentIndex = 0;
  let timeoutId; // Store timeout ID for scheduling next slide
  let initialTimeoutSet = false; // Flag to trigger only ONCE

  // At loading ensure
  let isTransitioning = false; // and only after that continue.
  carouselInner.style.transition = "none";

  //clone
  let firstItemClone = carouselItems[0].cloneNode(true);
  let lastItemClone = carouselItems[carouselItems.length - 1].cloneNode(true);
  carouselInner.appendChild(firstItemClone);
  carouselInner.insertBefore(lastItemClone, carouselInner.firstChild);
  const allCarouselItems = document.querySelectorAll(".home-carousel-item");

  let itemWidth = carouselItems[0].offsetWidth;
  let numItems = carouselItems.length;
  currentIndex = 1;
  carouselInner.style.transform = `translateX(${-itemWidth * currentIndex}px)`;

  const navigationDots = document.createElement("div");
  navigationDots.classList.add("carousel-dots");
  carouselInner.parentElement.appendChild(navigationDots);

  for (let i = 0; i < numItems; i++) {
    const dot = document.createElement("span");
    dot.classList.add("carousel-dot");
    dot.dataset.index = i + 1;
    navigationDots.appendChild(dot);

    dot.addEventListener("click", function () {
      const dotIndex = parseInt(this.dataset.index);
      if (dotIndex === currentIndex) return;
      goToSlide(dotIndex);
    });
  }

  updateDots();

  function updateDots() {
    const dots = document.querySelectorAll(".carousel-dot");
    dots.forEach((dot, index) => {
      if (index + 1 === currentIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  function goToSlide(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    clearTimeout(timeoutId); // Clear automatic.
    currentIndex = index;

    // Now transition effect and scheduling
    carouselInner.style.transition = "transform 1s ease-in-out";
    carouselInner.style.transform = `translateX(${-itemWidth * currentIndex}px)`;
    updateDots(); // and update it
  }

  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;

    // Transition + and call another action afterwards.
    carouselInner.style.transition = "transform 1s ease-in-out";
    carouselInner.style.transform = `translateX(${-itemWidth * currentIndex}px)`;
    updateDots(); // and update it afterwards
  }

  function scheduleNextSlide() {
    timeoutId = setTimeout(() => {
      nextSlide();
    }, 6000);
  }

  carouselInner.addEventListener("transitionend", function () {
    if (currentIndex === numItems + 1) {
      carouselInner.style.transition = "none";
      currentIndex = 1;
      carouselInner.style.transform = `translateX(${-itemWidth * currentIndex}px)`;
      updateDots();
    } else if (currentIndex === 0) {
      carouselInner.style.transition = "none";
      currentIndex = numItems;
      carouselInner.style.transform = `translateX(${-itemWidth * currentIndex}px)`;
      updateDots();
    }

    isTransitioning = false;
    scheduleNextSlide();
  });

  // setTimeout first call
  if (!initialTimeoutSet) {
    initialTimeoutSet = true;
    setTimeout(() => {
      isTransitioning = false // set it as false once the other is called
      carouselInner.style.transition =
        "transform 0.4s ease-in-out"; // and then start applying this effects.
      scheduleNextSlide(); // Start automatic after X seconds
    });
  }
});

// Dados dos produtos para os carrosséis
const productsCarouselData = [
  // ideal serem sempre múltiplos de 3
  { title: "Salas", directory: "assets/produtos/sala", numImages: 18 },
  { title: "Escritórios", directory: "assets/produtos/escritorio", numImages: 6 },
  { title: "Quartos", directory: "assets/produtos/quarto", numImages: 6 },
  { title: "Banheiros", directory: "assets/produtos/banheiro", numImages: 3 },
  { title: "Cozinhas", directory: "assets/produtos/cozinha", numImages: 9 },
];

const productsItemsToShow = 3;
const productsTransitionDuration = 200;

let expandedImg = null;

const overlayZoom = document.createElement("div");
overlayZoom.classList.add("overlay");
overlayZoom.style.zIndex = "9999";
overlayZoom.style.display = "none";
document.body.appendChild(overlayZoom);

const closeExpandedImage = () => {
  if (expandedImg) {
    expandedImg.removeEventListener("click", closeExpandedImage);
    document.body.removeChild(expandedImg);
    expandedImg = null;
    overlayZoom.style.display = "none";
    document.body.classList.remove("zoom-active");
    overlayZoom.style.pointerEvents = "none";
  }
};

overlayZoom.addEventListener("click", closeExpandedImage);
window.addEventListener("wheel", closeExpandedImage);
window.addEventListener("touchmove", closeExpandedImage);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeExpandedImage();
  }
});

function createProductsCarousel(data) {
  const productsMainContainer = document.createElement("div");
  productsMainContainer.classList.add("products-main-container");

  const productsTitle = document.createElement("h1");
  productsTitle.textContent = data.title;
  productsMainContainer.appendChild(productsTitle);

  const productsSeparator = document.createElement("div");
  productsSeparator.classList.add("products-separator");
  productsMainContainer.appendChild(productsSeparator);

  const isCursorDevice = window.matchMedia("(pointer: fine)").matches;
  let productsCarouselContainer;

  if (isCursorDevice) {
    const productsArrowsContainer = document.createElement("div");
    productsArrowsContainer.classList.add("products-arrows-container");

    const productsPrevButton = document.createElement("button");
    productsPrevButton.classList.add("products-carousel-arrow", "products-prev");
    const productsPrevImg = document.createElement("img");
    productsPrevImg.src = "assets/seta.png";
    productsPrevImg.alt = "prev";
    productsPrevButton.appendChild(productsPrevImg);

    const productsNextButton = document.createElement("button");
    productsNextButton.classList.add("products-carousel-arrow", "products-next");
    const productsNextImg = document.createElement("img");
    productsNextImg.src = "assets/seta.png";
    productsNextImg.alt = "next";
    productsNextButton.appendChild(productsNextImg);

    productsArrowsContainer.appendChild(productsPrevButton);
    productsArrowsContainer.appendChild(productsNextButton);
    productsMainContainer.appendChild(productsArrowsContainer);

    productsCarouselContainer = document.createElement("div");
    productsCarouselContainer.classList.add("products-carousel-container");
    const productsCarouselTrack = document.createElement("div");
    productsCarouselTrack.classList.add("products-carousel-track");
    productsCarouselContainer.appendChild(productsCarouselTrack);
    productsMainContainer.appendChild(productsCarouselContainer);

    document.body.insertBefore(
      productsMainContainer,
      document.getElementById("processo")
    );

    function createProductsCarouselItems() {
      for (let i = 1; i <= data.numImages; i++) {
        const productsCarouselItem = document.createElement("div");
        productsCarouselItem.classList.add("products-carousel-item");
        const img = document.createElement("img");
        img.loading = "lazy";
        img.src = `${data.directory}/${data.directory.split("/").pop()}${i}.webp`;
        img.alt = `${data.title} ${i}`;

        img.addEventListener("click", () => {
          if (expandedImg) {
            closeExpandedImage();
          }
          expandedImg = document.createElement("img");
          expandedImg.src = img.src;
          expandedImg.classList.add("expanded-image");
          document.body.appendChild(expandedImg);
          overlayZoom.style.display = "block";
          document.body.classList.add("zoom-active");
          expandedImg.addEventListener("click", closeExpandedImage);
          overlayZoom.style.pointerEvents = "auto";
        });

        productsCarouselItem.appendChild(img);
        productsCarouselTrack.appendChild(productsCarouselItem);
      }
    }

    createProductsCarouselItems();

    const productsCarouselItems =
      productsCarouselTrack.querySelectorAll(".products-carousel-item");
    const productsItemWidth =
      productsCarouselItems[0].offsetWidth +
      parseInt(window.getComputedStyle(productsCarouselItems[0]).marginRight);
    const productsNumItems = productsCarouselItems.length;
    let productsFirstVisibleItem = 0;
    let productsIsTransitioning = false;
    let productsStartX = 0;
    let productsCurrentX = 0;
    let productsIsDragging = false;
    let productsThreshold = productsItemWidth / 2;

    function cloneProductsItems() {
      for (let i = 0; i < productsItemsToShow; i++) {
        let productsFirstClone = productsCarouselItems[i].cloneNode(true);
        let productsLastClone =
          productsCarouselItems[productsNumItems - 1 - i].cloneNode(true);

        productsFirstClone.querySelector("img").addEventListener("click", () => {
          if (expandedImg) {
            closeExpandedImage();
          }
          expandedImg = document.createElement("img");
          expandedImg.src = productsFirstClone.querySelector("img").src;
          expandedImg.classList.add("expanded-image");
          document.body.appendChild(expandedImg);
          overlayZoom.style.display = "block";
          document.body.classList.add("zoom-active");
          expandedImg.addEventListener("click", closeExpandedImage);
          overlayZoom.style.pointerEvents = "auto";
        });

        productsLastClone.querySelector("img").addEventListener("click", () => {
          if (expandedImg) {
            closeExpandedImage();
          }
          expandedImg = document.createElement("img");
          expandedImg.src = productsLastClone.querySelector("img").src;
          expandedImg.classList.add("expanded-image");
          document.body.appendChild(expandedImg);
          overlayZoom.style.display = "block";
          document.body.classList.add("zoom-active");
          expandedImg.addEventListener("click", closeExpandedImage);
          overlayZoom.style.pointerEvents = "auto";
        });

        productsCarouselTrack.appendChild(productsFirstClone);
        productsCarouselTrack.insertBefore(
          productsLastClone,
          productsCarouselItems[0]
        );
      }
    }

    cloneProductsItems();

    const productsClonedItems =
      productsCarouselTrack.querySelectorAll(".products-carousel-item");
    const productsTotalItems = productsClonedItems.length;

    productsFirstVisibleItem = productsItemsToShow;
    productsCarouselTrack.style.transform = `translateX(-${
      productsFirstVisibleItem * productsItemWidth
    }px)`;

    function calculateProductsSlidePosition(index) {
      return -index * productsItemWidth;
    }

    function updateProductsCarouselItems() {
      productsClonedItems.forEach((item, index) => {
        const itemIndex = calculateProductsLoopIndex(index);
        item.querySelector("img").src = `${data.directory}/${
          data.directory.split("/").pop()
        }${itemIndex}.webp`;
      });
    }

    function calculateProductsLoopIndex(index) {
      const baseIndex = index - productsItemsToShow;
      return (baseIndex % productsNumItems + productsNumItems) % productsNumItems + 1;
    }

    updateProductsCarouselItems();

    function moveToProductsSlide(index) {
      if (productsIsTransitioning) return;
      productsIsTransitioning = true;
      productsCarouselTrack.style.transition = "transform .5s ease-in-out";
      productsCarouselTrack.style.transform = `translateX(${calculateProductsSlidePosition(
        index
      )}px)`;

      productsFirstVisibleItem = index;
      updateProductsCarouselItems();
      setTimeout(() => {
        productsIsTransitioning = false;
      }, productsTransitionDuration);
    }

    const checkProductsAndResetPosition = () => {
      if (productsFirstVisibleItem >= productsTotalItems - productsItemsToShow) {
        productsCarouselTrack.style.transition = "none";
        productsFirstVisibleItem = productsItemsToShow;
        productsCarouselTrack.style.transform = `translateX(${calculateProductsSlidePosition(
          productsFirstVisibleItem
        )}px)`;
      } else if (productsFirstVisibleItem <= productsItemsToShow - 1) {
        productsCarouselTrack.style.transition = "none";
        productsFirstVisibleItem = productsTotalItems - productsItemsToShow - 1;
        productsCarouselTrack.style.transform = `translateX(${calculateProductsSlidePosition(
          productsFirstVisibleItem
        )}px)`;
      }
    };

    function startDrag(e) {
      productsIsDragging = true;
      if (e.type === "mousedown") {
        productsStartX = e.pageX - productsCarouselTrack.offsetLeft;
      } else {
        productsStartX = e.touches[0].pageX - productsCarouselTrack.offsetLeft;
      }
      productsCarouselContainer.classList.add("dragging");
      productsCarouselTrack.style.transition = "none";
    }

    function moveDrag(e) {
      if (!productsIsDragging) return;
      if (e.type === "mousemove") {
        productsCurrentX = e.pageX - productsCarouselTrack.offsetLeft;
      } else {
        productsCurrentX = e.touches[0].pageX - productsCarouselTrack.offsetLeft;
      }
      productsCarouselTrack.style.transform = `translateX(${
        calculateProductsSlidePosition(productsFirstVisibleItem) +
        (productsCurrentX - productsStartX)
      }px)`;
    }

    const endDrag = () => {
      if (!productsIsDragging) return;
      productsIsDragging = false;
      productsCarouselContainer.classList.remove("dragging");
      let diff = productsCurrentX - productsStartX;

      if (Math.abs(diff) > productsThreshold) {
        const dragDistanceInItems = Math.round(diff / productsItemWidth);
        let targetIndex = productsFirstVisibleItem - dragDistanceInItems;
        let adjustedTargetIndex = targetIndex;

        if (diff > 0) {
          //Dragging right
          if (targetIndex < productsItemsToShow) {
            productsCarouselTrack.style.transition = "none";
            adjustedTargetIndex =
              productsTotalItems - productsItemsToShow + (targetIndex - productsItemsToShow);
            productsCarouselTrack.style.transform = `translateX(${calculateProductsSlidePosition(
              adjustedTargetIndex
            )}px)`;
            productsCarouselTrack.offsetHeight;
          }
        } else {
          //Dragging left
          if (targetIndex > productsTotalItems - productsItemsToShow - 1) {
            productsCarouselTrack.style.transition = "none";
            adjustedTargetIndex = productsItemsToShow + (targetIndex - (productsTotalItems - productsItemsToShow));
            productsCarouselTrack.style.transform = `translateX(${calculateProductsSlidePosition(
              adjustedTargetIndex
            )}px)`;
            productsCarouselTrack.offsetHeight;
          }
        }

        // Ajustar o índice para múltiplas imagens
        let numImagesToMove =
          productsItemsToShow *
          Math.round((adjustedTargetIndex - productsFirstVisibleItem) / productsItemsToShow);
        if (numImagesToMove !== 0) {
          moveToProductsSlide(productsFirstVisibleItem + numImagesToMove);
        } else {
          productsCarouselTrack.style.transition = "transform 0.2s ease-in-out";
          productsCarouselTrack.style.transform = `translateX(${calculateProductsSlidePosition(
            productsFirstVisibleItem
          )}px)`;
        }
      } else {
        productsCarouselTrack.style.transition = "transform 0.2s ease-in-out";
        productsCarouselTrack.style.transform = `translateX(${calculateProductsSlidePosition(
          productsFirstVisibleItem
        )}px)`;
      }
      productsStartX = 0;
      productsCurrentX = 0;
    };

    productsNextButton.addEventListener("click", () => {
      if (productsIsTransitioning) return;
      if (productsFirstVisibleItem >= productsTotalItems - productsItemsToShow - productsItemsToShow) {
        productsCarouselTrack.style.transition = "none";
        productsFirstVisibleItem = productsItemsToShow - productsItemsToShow;
        productsCarouselTrack.style.transform = `translateX(${calculateProductsSlidePosition(
          productsFirstVisibleItem
        )}px)`;
        productsCarouselTrack.offsetHeight;
      }
      moveToProductsSlide(productsFirstVisibleItem + productsItemsToShow);
    });

    productsPrevButton.addEventListener("click", () => {
      if (productsIsTransitioning) return;
      if (productsFirstVisibleItem <= productsItemsToShow) {
        productsCarouselTrack.style.transition = "none";
        productsFirstVisibleItem = productsTotalItems - productsItemsToShow;
        productsCarouselTrack.style.transform = `translateX(${calculateProductsSlidePosition(
          productsFirstVisibleItem
        )}px)`;
        productsCarouselTrack.offsetHeight;
      }
      moveToProductsSlide(productsFirstVisibleItem - productsItemsToShow);
    });

    productsCarouselTrack.addEventListener("transitionend", () => {
      checkProductsAndResetPosition();
    });
      if (window.innerWidth <= 1024) {
          productsCarouselContainer.addEventListener("mousedown", startDrag);
          productsCarouselContainer.addEventListener("mousemove", moveDrag);
          productsCarouselContainer.addEventListener("mouseup", endDrag);
          productsCarouselContainer.addEventListener("mouseleave", endDrag);

          productsCarouselContainer.addEventListener("touchstart", startDrag);
          productsCarouselContainer.addEventListener("touchmove", moveDrag);
          productsCarouselContainer.addEventListener("touchend", endDrag);
      }

  } else {

    productsCarouselContainer = document.createElement("div");
    productsCarouselContainer.classList.add("products-carousel-container");

    const productsCarouselTrack = document.createElement("div");
    productsCarouselTrack.classList.add("products-carousel-track");
    productsCarouselContainer.appendChild(productsCarouselTrack);
    productsMainContainer.appendChild(productsCarouselContainer);

    document.body.insertBefore(
      productsMainContainer,
      document.getElementById("processo")
    );

    function createProductsCarouselItems() {
      for (let i = 1; i <= data.numImages; i++) {
        const productsCarouselItem = document.createElement("div");
        productsCarouselItem.classList.add("products-carousel-item");
        const img = document.createElement("img");
        img.loading = "lazy";
        img.src = `${data.directory}/${data.directory.split("/").pop()}${i}.webp`;
        img.alt = `${data.title} ${i}`;

        img.addEventListener("click", () => {
          expandedImg = document.createElement("img");
          expandedImg.src = img.src;
          expandedImg.classList.add("expanded-image");
          document.body.appendChild(expandedImg);
          overlayZoom.style.display = "block";
          document.body.classList.add("zoom-active");
          expandedImg.addEventListener("click", closeExpandedImage);
          overlayZoom.style.pointerEvents = "auto";
        });

        productsCarouselItem.appendChild(img);
        productsCarouselTrack.appendChild(productsCarouselItem);
      }
    }

    createProductsCarouselItems();

    const productsCarouselItems =
      productsCarouselTrack.querySelectorAll(".products-carousel-item");
    const productsItemWidth =
      productsCarouselItems[0].offsetWidth +
      parseInt(window.getComputedStyle(productsCarouselItems[0]).marginRight);

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    const maxTranslate = 0;
    const minTranslate = -(
      productsCarouselItems.length * productsItemWidth -
      productsCarouselContainer.offsetWidth
    );

    productsCarouselTrack.addEventListener("touchstart", (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      productsCarouselTrack.style.transition = "none";
    });

    productsCarouselTrack.addEventListener("touchmove", (e) => {
      if (!isDragging) return;

      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;

      currentTranslate = Math.max(
        Math.min(prevTranslate + deltaX, maxTranslate),
        minTranslate
      );
      productsCarouselTrack.style.transform = `translateX(${currentTranslate}px)`;
    });

    productsCarouselTrack.addEventListener("touchend", () => {
      isDragging = false;
      prevTranslate = currentTranslate;
    });
  }
}

function disableBlueHighlight() {
  const style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = `
        * {
            -webkit-tap-highlight-color: transparent;
        }
    `;
  document.head.appendChild(style);
}

function removeHoverAnimations() {
  if (!window.matchMedia("(pointer: fine)").matches) {
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `
            .products-carousel-item img:hover,
            .home-budget-button:hover,
            .products-carousel-arrow:hover,
            .header-contacts button:hover {
                transform: none !important;
                background-color: inherit !important;
            }
        `;
    document.head.appendChild(style);
  }
}

function updatePresentationText() {
  const isCursorDevice = window.matchMedia("(pointer: fine)").matches;
  const presentationTextElement = document.querySelector(
    ".products-apresentation-text"
  );

  if (!isCursorDevice) {
    presentationTextElement.innerHTML =
      "Confira abaixo alguns dos serviços que oferecemos!<br>Arraste as imagens para ver mais";
  } else {
    presentationTextElement.innerHTML =
      "Confira abaixo alguns dos serviços que oferecemos!";
  }
}

function initialize() {
  disableBlueHighlight();
  removeHoverAnimations();
  updatePresentationText();

  productsCarouselData.forEach((data) => {
    createProductsCarousel(data);
  });
}

document.addEventListener("DOMContentLoaded", initialize);
window.addEventListener("resize", updatePresentationText);