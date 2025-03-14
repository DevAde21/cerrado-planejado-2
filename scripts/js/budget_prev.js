document.addEventListener('DOMContentLoaded', function () {

    // Menu de Navegação para Media Query 2
    const menuToggle = document.querySelector('.secondary-menu-toggle');
    const secondaryMenu = document.createElement('div'); // Cria o menu secundário
    secondaryMenu.classList.add('secondary-menu');
    document.body.appendChild(secondaryMenu); // Adiciona o menu ao body

    // Cria a lista de itens do menu secundário
    const menuItems = `
        <ul>
            <li><a href="../../index.html#inicio" class="active">Tela Inicial</a></li>
            <li><a href="../../index.html#produtos">Ambientes</a></li>
            <li><a href="../../index.html#processo">Etapas do processo</a></li>
            <li><a href="../../index.html#escolher">Por que nos escolher</a></li>
            <li><a href="../html/about_us.html">Sobre nós</a></li>
        </ul>
        <div class="secondary-menu-contacts">
          <a href="https://www.instagram.com/cerradoplanejado/" target="_blank" rel="noopener noreferrer">
              <img class="secondary-menu-contacts-icon" src="../../assets/instagram2.png" alt="Instagram">
            </a>
            <a href="https://wa.me/+5561981002114" target="_blank" rel="noopener noreferrer">
                <img class="secondary-menu-contacts-icon" src="../../assets/whatsapp2.png" alt="WhatsApp">
            </a>
            <a href="mailto:contato@cerradoplanejado.com.br">
                <img class="secondary-menu-contacts-icon" src="../../assets/email2.png" alt="E-mail">
            </a>
        </div>
    `;
    secondaryMenu.innerHTML = menuItems;

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            secondaryMenu.classList.toggle('active'); // Abre/fecha o menu
            overlay.style.display = 'block'; //mostra o overlay
            document.body.classList.add('menu-active'); // Adiciona classe para prevenir scroll
        });
    }

    // Fecha o menu ao clicar fora dele
    if (overlay) {
        overlay.addEventListener('click', function() {
            secondaryMenu.classList.remove('active');
            overlay.style.display = 'none';
            document.body.classList.remove('menu-active'); // Remove classe para permitir scroll
        });
    }

    // Redireciona para a página principal (index.html) e ancora na seção
    const navLinks = document.querySelectorAll('.secondary-menu ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Impede o comportamento padrão do link

            const targetHref = this.getAttribute('href'); // Pega o href do link

            // Redireciona para index.html com a âncora
            window.location.href = targetHref;
        });
    });
});

// Função para desativar o efeito de seleção azul
function disableBlueHighlight() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        * {
            -webkit-tap-highlight-color: transparent;
        }
    `;
    document.head.appendChild(style);
}

// Função para remover animações de hover em dispositivos sem cursor
function removeHoverAnimations() {
    if (!window.matchMedia('(pointer: fine)').matches) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .header-contacts button:hover, .secondary-menu-icon:hover {
                transform: none !important;
                background-color: inherit !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Executar as funções ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    disableBlueHighlight();
    removeHoverAnimations();
});