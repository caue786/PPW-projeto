
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
function carregarPaginaCarrinho() {
    const containerCards = document.getElementById('lista-carrinho'); 
    const containerResumo = document.getElementById('resumo-carrinho');
    const elementoTotal = document.getElementById('total-carrinho');

    if (!containerResumo) return; 

    
    if (containerCards) containerCards.innerHTML = '';
    containerResumo.innerHTML = '';

    const carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];
    let precoTotal = 0;

    if (carrinho.length === 0) {
        containerResumo.innerHTML = '<div class="alert alert-info">Seu carrinho está vazio.</div>';
        if (elementoTotal) elementoTotal.innerText = 'R$ 0,00';
        return;
    }

    carrinho.forEach(item => {
        
        const qtd = item.quantidade || 1;
        const totalItem = item.price * qtd;

        precoTotal += totalItem;

        // Cria a lista
        const htmlItem = `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 5px;">
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

    // Atualiza o total
    if (elementoTotal) {
        elementoTotal.innerText = precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
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

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();       // Carrega todos no início
    carregarPaginaCarrinho();
    if (typeof atualizarCabecalho === 'function') atualizarCabecalho(); // Só se já tiver feito o login
    
    configurarBusca(); // <--- ATIVA A BUSCA AQUI
});