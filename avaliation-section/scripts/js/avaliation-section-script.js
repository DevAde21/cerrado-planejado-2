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
function goToSlide(index) {
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
  goToSlide(avaliationCurrentIndex + 1);
});
document.getElementById('prevBtn').addEventListener('click', () => {
  goToSlide(avaliationCurrentIndex - 1);
});

window.addEventListener('resize', collapseAllComments);
