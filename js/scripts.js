alert("O arquivo JS foi carregado!");
const api_base_url = 'https://ppw-1-tads.vercel.app/api';
const key_usuario = 'usuario_logado';
const key_carrinho = 'carrinho_compras';
const key_enderecos = 'meus_enderecos';


// a API caiu, esses serão os produtos oficiais do site
// --- DADOS (ESTOQUE) ---
const produtosDoSite = [
    { id: 1, name: "Amazon Echo Dot Max", image: "imagens/ECHODOT SMART SPEAKER.jpg", description: "Smart speaker com Alexa...", price: 472.80, originalPrice: 859.65, discountText: "45% off", secao: "promocao" },
    { id: 2, name: "Monitor Curvo", image: "imagens/monitorcurvo.jpg", description: "23.6 Polegadas...", price: 520.23, originalPrice: 945.89, discountText: "45% off", secao: "promocao" },
    { id: 3, name: "PC Gamer Completo", image: "imagens/pc gamer.jpg", description: "Intel Core i7...", price: 3389.69, originalPrice: 6163.09, discountText: "45% off", secao: "promocao" },
    { id: 4, name: "Apple iPhone 16", image: "imagens/iphone16 512gb.jpg", description: "iPhone iOS 18...", price: 4544.55, originalPrice: 9089.10, discountText: "50% off", secao: "promocao" },
    { id: 5, name: "PHILIPS Smart TV 43\"", image: "imagens/philips smart tv.jpg", description: "Full HD...", price: 1449.88, secao: "estoque" },
    { id: 6, name: "Basike Projetor", image: "imagens/projetor.jpg", description: "Projetor Full HD...", price: 997.12, secao: "estoque" },
    { id: 7, name: "Projetor Smart 4K", image: "imagens/projetor smart.jpg", description: "Full HD Portátil...", price: 499.99, secao: "estoque" },
    { id: 8, name: "ASUS ROG Strix", image: "imagens/ASUS ROG NOTEBOOK.jpg", description: "Gaming Laptop...", price: 19261.00, secao: "estoque" }
];

// --- 1. VITRINE DE PRODUTOS ---
async function carregarProdutos() {
    const containerPromocao = document.getElementById('lista-produtos');
    const containerEstoque = document.getElementById('lista-estoque');

    if (!containerPromocao) return; 

    containerPromocao.innerHTML = '';
    if (containerEstoque) containerEstoque.innerHTML = '';

    produtosDoSite.forEach(produto => {
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
                        <p class="card-text small text-muted">${produto.description.substring(0, 80)}...</p>
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

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    carregarPaginaCarrinho();
});