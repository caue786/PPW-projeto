
const api_base_url = 'https://ppw-1-tads.vercel.app/api';
const key_usuario = 'usuario_logado';
const key_carrinho = 'carrinho_compras';
const key_enderecos = 'meus_enderecos';


// a API caiu, esses serão os produtos oficiais do site
// --- DADOS (ESTOQUE) ---
const produtosDoSite = [
    // === SEÇÃO: PROMOÇÃO ===
    {
        id: 1,
        name: "Amazon Echo Dot Max",
        image: "imagens/ECHODOT SMART SPEAKER.jpg",
        description: "Smart speaker com Alexa, som envolvente e hub de casa inteligente integrado, 1x 0.8\" tweeter, 1x 2.5\" cor ROXA.",
        price: 472.80,
        originalPrice: 859.65,
        discountText: "45% off",
        secao: "promocao"
    },
    {
        id: 2,
        name: "Monitor Curvo",
        image: "imagens/monitorcurvo.jpg",
        description: "23.6 Polegadas 100Hz Full HD LED – Tela 1500R, 1MS, 98% sRGB, HDMI/VGA, Adaptive Sync Home office",
        price: 520.23,
        originalPrice: 945.89,
        discountText: "45% off",
        secao: "promocao"
    },
    {
        id: 3,
        name: "PC Gamer Completo",
        image: "imagens/pc gamer.jpg",
        description: "PC Gamer Completo Intel Core i7 16GB SSD 1TB Monitor 23\" Kit Gamer Fonte 400W Strong Tech.",
        price: 3389.69,
        originalPrice: 6163.09,
        discountText: "45% off",
        secao: "promocao"
    },
    {
        id: 4,
        name: "Apple iPhone 16 (512 GB)",
        image: "imagens/iphone16 512gb.jpg",
        description: "iPhone com iOS 18 Cabo para recarga com conector USB-C, Tela Super Retina XDR OLED sem bordas de 6,1 polegadas",
        price: 4544.55,
        originalPrice: 9089.10,
        discountText: "50% off",
        secao: "promocao"
    },

    // === SEÇÃO: DE VOLTA AO ESTOQUE ===
    {
        id: 5,
        name: "PHILIPS Smart TV 43\"",
        image: "imagens/philips smart tv.jpg",
        description: "Full HD, 43PFG6909/78, Google TV, Comando de Voz, Dolby Audio, Google Assistente Integrado, Google TV, HDR10/HLG",
        price: 1449.88,
        secao: "estoque" 
    },
    {
         id: 6,
         name: "Basike Projetor portatil",
         image: "imagens/projetor.jpg",
         description: "Projetor Inteligente Full HD 1080P 15000 Lumens, 2.4G+5G+WIFI 6 Android 12, Bluetooth 5.4, Suporte 4K e Montagem 180°",
         price: 997.12,
         secao: "estoque"
    },
    {
         id: 7,
         name: "Projetor Smart 1080P 4K",
         image: "imagens/projetor smart.jpg",
         description: "Full HD Portátil com Alto-Falante Integrado, 11000 Lm WiFi 6, Bluetooth 5.0 e Correção Automática - bettdow AC1059, Beige",
         price: 499.99,
         secao: "estoque"
    },
    {
         id: 8,
         name: "ASUS 2025 ROG Strix G16",
         image: "imagens/ASUS ROG NOTEBOOK.jpg",
         description: "Gaming Laptop, 16\" FHD 165Hz Display, 16-Core AMD Ryzen 9 8940HX, RTX 5070 Ti (TGP 140W), MUX Switch, Window 11 (64GB RAM 4TB PCIe SSD)",
         price: 19261.00,
         secao: "estoque"
    }
];


// --- 1. VITRINE DE PRODUTOS (aceita filtro de busca) ---
// O parâmetro 'listaOpcional' serve para quando buscarmos algo,
// Se não passarmos nada, ele usa a lista completa 'produtosDoSite'.
async function carregarProdutos(listaOpcional) {
    const containerPromocao = document.getElementById('lista-produtos');
    const containerEstoque = document.getElementById('lista-estoque');

    if (!containerPromocao) return;

    // Limpa a tela antes de desenhar
    containerPromocao.innerHTML = '';
    if (containerEstoque) containerEstoque.innerHTML = '';

    // Define qual lista usar: a filtrada (se existir) ou a completa
    const produtosParaExibir = listaOpcional || produtosDoSite;

    // Se a busca não retornou nada, mostra aviso
    if (produtosParaExibir.length === 0) {
        containerPromocao.innerHTML = '<div class="col-12"><p class="alert alert-warning">Nenhum produto encontrado.</p></div>';
        return;
    }

    // Desenha os produtos (igual antes)
    produtosParaExibir.forEach(produto => {
        const precoFormatado = produto.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let htmlPreco = produto.originalPrice 
            ? `<p class="text-decoration-line-through text-danger">${produto.originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><p class="card-text text-center text-success fw-bold">${produto.discountText} ${precoFormatado}</p>`
            : `<p class="card-text text-center fw-bold">${precoFormatado}</p>`;

        const cardHTML = `
            <div class="col mb-4">
                <div class="card h-100 shadow-sm" style="width: 18rem;">
                    <img src="${produto.image}" class="card-img-top" alt="${produto.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${produto.name}</h5>
                        <p class="card-text">${produto.description}</p>
                        ${htmlPreco}
                        <button class="btn btn-dark w-100 mt-auto" onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
                    </div>
                </div>
            </div>`;
        
        if (produto.secao === 'promocao') containerPromocao.innerHTML += cardHTML;
        else if (produto.secao === 'estoque' && containerEstoque) containerEstoque.innerHTML += cardHTML;
    });
}

// --- 2. ADICIONAR AO CARRINHO ---
function adicionarAoCarrinho(id) {
    const produtoOriginal = produtosDoSite.find(p => p.id === id);
    if (!produtoOriginal) return;

    let carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];

   
    const itemNoCarrinho = carrinho.find(item => item.id === id);

    if (itemNoCarrinho) {
       
        itemNoCarrinho.quantidade = (itemNoCarrinho.quantidade || 0) + 1;
        alert(`Atualizado! Agora você tem ${itemNoCarrinho.quantidade} unidades de ${produtoOriginal.name}`);
    } else {
       
        carrinho.push({ ...produtoOriginal, quantidade: 1 });
        alert(`${produtoOriginal.name} adicionado ao carrinho!`);
    }

    localStorage.setItem('carrinho_compras', JSON.stringify(carrinho));
}

// --- 3. MOSTRAR CARRINHO  ---
// --- ATUALIZAÇÃO: Carregar Carrinho (Para suportar Frete) ---
// Substitua a sua função 'carregarPaginaCarrinho' antiga por esta:
function carregarPaginaCarrinho() {
    const containerResumo = document.getElementById('resumo-carrinho');
    const elementoTotal = document.getElementById('total-carrinho');
    const elementoSubtotal = document.getElementById('valor-subtotal');
    const containerCards = document.getElementById('lista-carrinho');

    if (!containerResumo) return;

    if (containerCards) containerCards.innerHTML = ''; 
    containerResumo.innerHTML = '';

    const carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];
    let precoTotal = 0;

    if (carrinho.length === 0) {
        containerResumo.innerHTML = '<div class="alert alert-info">Seu carrinho está vazio.</div>';
        if (elementoTotal) elementoTotal.innerText = 'R$ 0,00';
        if (elementoSubtotal) elementoSubtotal.innerText = 'R$ 0,00';
        return;
    }

    carrinho.forEach(item => {
        const qtd = item.quantidade || 1; 
        const totalItem = item.price * qtd;
        precoTotal += totalItem;

        const htmlItem = `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 5px;">
                    <div>
                        <h6 class="mb-0 fw-bold">${item.name}</h6>
                        <small class="text-muted">Unit: R$ ${item.price.toFixed(2)}</small>
                    </div>
                </div>
                <div class="text-end">
                    <span class="badge bg-primary rounded-pill mb-1">Qtd: ${qtd}</span>
                    <div class="fw-bold text-success">R$ ${totalItem.toFixed(2)}</div>
                    <button class="btn btn-sm btn-link text-danger p-0" onclick="removerDoCarrinho(${item.id})">Remover</button>
                </div>
            </li>
        `;
        containerResumo.innerHTML += htmlItem;
    });

    // Atualiza Subtotal e Total Inicial
    if (elementoSubtotal) elementoSubtotal.innerText = precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (elementoTotal) {
        elementoTotal.dataset.valorReal = precoTotal; // Guarda o valor numérico escondido para contas
        elementoTotal.innerText = precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}

// --- 8. CÁLCULO DE FRETE (MOCK - Tarefa 7b) ---
function calcularFrete() {
    const cep = document.getElementById('input-cep').value;
    const divOpcoes = document.getElementById('opcoes-frete');

    if (cep.length < 8) {
        alert("Por favor, digite um CEP válido (8 dígitos).");
        return;
    }

    // Simulação de Loading
    divOpcoes.innerHTML = '<p class="text-muted small">Calculando...</p>';

    setTimeout(() => {
        // Opções fictícias de frete
        const opcoes = [
            { nome: "PAC (Econômico)", valor: 25.00, prazo: "5 a 10 dias" },
            { nome: "Sedex (Rápido)", valor: 45.90, prazo: "2 a 4 dias" }
        ];

        divOpcoes.innerHTML = ''; // Limpa o loading

        opcoes.forEach((opcao, index) => {
            divOpcoes.innerHTML += `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="frete" id="frete-${index}" value="${opcao.valor}" onchange="atualizarTotalComFrete(${opcao.valor})">
                    <label class="form-check-label w-100" for="frete-${index}">
                        <div class="d-flex justify-content-between">
                            <span>${opcao.nome} - ${opcao.prazo}</span>
                            <strong>R$ ${opcao.valor.toFixed(2).replace('.', ',')}</strong>
                        </div>
                    </label>
                </div>
            `;
        });
    }, 1000); // Demora 1 segundo para parecer real
}

// --- 9. ATUALIZAR TOTAL QUANDO ESCOLHE FRETE ---
function atualizarTotalComFrete(valorFrete) {
    const elementoTotal = document.getElementById('total-carrinho');
    const elementoSubtotal = document.getElementById('valor-subtotal');
    
    // Pega o valor dos produtos (limpando o R$ e trocando vírgula por ponto)
    // Uma forma mais segura é recalcular do carrinho, mas vamos usar o texto da tela pra simplificar:
    let valorProdutos = 0;
    
    // Recalcula o subtotal baseado no carrinho salvo (mais seguro)
    const carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];
    carrinho.forEach(item => {
        valorProdutos += item.price * (item.quantidade || 1);
    });

    const totalFinal = valorProdutos + valorFrete;

    elementoTotal.innerText = totalFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Salva o frete escolhido temporariamente (para usar na finalização)
    localStorage.setItem('frete_escolhido', valorFrete);
}

// --- 10. FINALIZAR PEDIDO (Tarefa 7c) ---
// --- 10. FINALIZAR PEDIDO (Tarefa 7c) ---
function finalizarPedido() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];
    
    // 1. Valida se tem coisas no carrinho
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    // 2. Cria o pacote do pedido (Gera o ID, Data e pega os Itens)
    const novoPedido = {
        id: Math.floor(Math.random() * 10000) + 1000, // Gera ID aleatório (ex: 12495)
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(), // Opcional
        itens: carrinho,
        total: carrinho.reduce((acc, item) => acc + (item.price * (item.quantidade || 1)), 0)
        // Se tiver frete, somaria aqui também
    };

    // 3. Lê o histórico antigo de pedidos (se existir)
    let historico = JSON.parse(localStorage.getItem('meus_pedidos')) || [];
    
    // 4. Adiciona o novo pedido na lista
    historico.push(novoPedido);

    // 5. GRAVA TUDO NA MEMÓRIA (Aqui é o segredo!) <---
    localStorage.setItem('meus_pedidos', JSON.stringify(historico));

    // 6. Limpa o carrinho atual (pois já virou pedido)
    localStorage.removeItem('carrinho_compras');

    // 7. REDIRECIONA PARA A PÁGINA DE SUCESSO <---
    window.location.href = 'sucesso-pedido.html';
}

// --- 4. REMOVER ITEM ---
function removerDoCarrinho(id) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];
    carrinho = carrinho.filter(item => item.id !== id);
    localStorage.setItem('carrinho_compras', JSON.stringify(carrinho));
    carregarPaginaCarrinho();
}


//  SISTEMA DE BUSCA 
function configurarBusca() {
    const formBusca = document.getElementById('form-busca');
    
    if (formBusca) {
        formBusca.addEventListener('submit', (event) => {
            event.preventDefault(); // Não deixa a página recarregar
            
            const termo = document.getElementById('input-busca').value.toLowerCase();
            
            // O PDF pede para usar filter() 
            // Filtramos quem tem o termo no NOME ou na DESCRIÇÃO
            const produtosFiltrados = produtosDoSite.filter(produto => {
                return produto.name.toLowerCase().includes(termo) || 
                       produto.description.toLowerCase().includes(termo);
            });

            // Chama a vitrine passando só os produtos que sobraram
            carregarProdutos(produtosFiltrados);
        });
    }
}

// --- 11. LISTAR MEUS PEDIDOS (Tarefa 8) ---
function carregarMeusPedidos() {
    const containerPedidos = document.getElementById('lista-pedidos');
    const msgVazio = document.getElementById('mensagem-vazio');

    // Só roda se estiver na página "Meus Pedidos"
    if (!containerPedidos) return;

    const pedidos = JSON.parse(localStorage.getItem('meus_pedidos')) || [];

    // Se não tiver pedidos, mostra a mensagem de vazio
    if (pedidos.length === 0) {
        if (msgVazio) msgVazio.classList.remove('d-none');
        return;
    }

    // Desenha cada pedido
    // Note o link: href="pedido.html?id=${pedido.id}" -> Isso cumpre a Tarefa 8b
    pedidos.reverse().forEach(pedido => {
        const dataFormatada = pedido.data || "Data desconhecida";
        const totalFormatado = pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        const htmlPedido = `
            <div class="col-12 mb-3">
                <div class="card shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center bg-light">
                        <div>
                            <strong>Pedido #${pedido.id}</strong>
                            <span class="text-muted ms-2">Realizado em ${dataFormatada}</span>
                        </div>
                        <span class="badge bg-success">Concluído</span>
                    </div>
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <p class="mb-1"><strong>Total:</strong> ${totalFormatado}</p>
                                <p class="mb-0 text-muted">${pedido.itens.length} itens neste pedido</p>
                            </div>
                            <div class="col-md-4 text-end">
                                <a href="pedido.html?id=${pedido.id}" class="btn btn-outline-primary">Visualizar Detalhes</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        containerPedidos.innerHTML += htmlPedido;
    });
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
carregarProdutos();
    carregarPaginaCarrinho();
    atualizarCabecalho();
    configurarBusca();
    atualizarBadgeCarrinho();
    carregarMeusPedidos(); // <--- ADICIONE ESTA LINHA NOVA
});