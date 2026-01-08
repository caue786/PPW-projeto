
const api_base_url = 'https://ppw-1-tads.vercel.app/api';

// lista para guardar os produtos que vem da net
let produtosGlobais = [];

/* ==========================================================================
   FLUXO B: PRODUTOS, CARRINHO E VENDAS:
   ========================================================================== */

// --- 1 FUNÇÃO PRINCIPAL QUE DESENHA A VITRINE DE PRODUTOS ---
async function carregarProdutos(listaFiltrada = null) {

    //pega as divs que contem os IDs
    const containerPromocao = document.getElementById('lista-produtos');
    const containerEstoque = document.getElementById('lista-estoque');
    //PARA A FUNÇÃO SE A VARIAVEL FOR VAZIA
    if (!containerPromocao) return;

    // Se é o carregamento inicial, sem busca, pega da API
    if (listaFiltrada === null) {
        try {
            
            //PEGA OS PRODUTOS DA API
            const resposta = await fetch(`${api_base_url}/products`);
            
            //SE DER ERRO NA HORA DE PEGAR OS PRODUTOS
            if (!resposta.ok) throw new Error('Falha ao comunicar com o servidor.');
            //RETORNO CONVERTIDO EM JSON
            const dados = await resposta.json();
            
            // GUARDA NA VARIAVEL PARA FACILITAR A BUSCA 
            //SE A API MANDA DENTRO DE PRODUCTS || não
            produtosGlobais = dados.products || dados;

            //CAPTURA DE POSSIVEIS ERROS 
        } catch (erro) {
            console.error("Erro Na Vitrine:", erro);
            containerPromocao.innerHTML = `
                <div class="alert alert-danger w-100 text-center">
                    <i class="fa fa-exclamation-triangle"></i> 
                    Não foi possível carregar os produtos no momento, tente novamente.
                </div>`;
            return;
        }
    }

    //exibe na vitrine a listafiltrada ou a lista produtosglobais
    const produtosParaExibir = listaFiltrada || produtosGlobais;

    // Limpa a tela de promoção
    containerPromocao.innerHTML = '';
    //limpa a tela de estoque
    if (containerEstoque) containerEstoque.innerHTML = '';

    //se a lista estiver vazia/nao ter o item
    if (produtosParaExibir.length === 0) {
        containerPromocao.innerHTML = '<div class="alert alert-warning w-100">Nenhum produto encontrado.</div>';
        return;
    }

    // constroi os cards para cada produto dentro da lista
    //produto = item atual, index = posição na lista
    produtosParaExibir.forEach((produto, index) => {   
        //formata o preço para Real  
        const precoNum = parseFloat(produto.price);
        const precoFormatado = precoNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        // Separação Visual: Os 4 primeiros produtos são Promoção
        let htmlPreco;
        if (index < 4 && !listaFiltrada) { 
             const precoAntigo = (precoNum * 1.2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
             htmlPreco = `
                <p class="text-decoration-line-through text-danger mb-0 small">${precoAntigo}</p>
                <p class="card-text text-center text-success fw-bold mt-0">Oferta: ${precoFormatado}</p>
             `;
        } else {
             htmlPreco = `<p class="card-text text-center fw-bold fs-5 mt-3">${precoFormatado}</p>`;
        }
  
        //COMO CRIAR O CARD
        const cardHTML = `
            <div class="col mb-4">
                <div class="card h-100 shadow-sm" style="width: 18rem;">
                    <img src="${produto.image}" class="card-img-top" alt="${produto.name}" 
                         style="height: 200px; object-fit: cover;" 
                         onerror="this.src='https://via.placeholder.com/300?text=Imagem+Indispon%C3%ADvel'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${produto.name}</h5>
                        <p class="card-text text-muted small">${(produto.description || '').substring(0, 90)}...</p>
                        ${htmlPreco}
                        <button class="btn btn-gradiente w-100 mt-auto" onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
                    </div>
                </div>
            </div>`;

            //ONDE POR O CARD:
            //SE FILTRADO = CONTAINER PRINCIPAL, SENAO = PROMOÇÃO + PREÇO NORMAL
        if (listaFiltrada) {
            containerPromocao.innerHTML += cardHTML;
        } else {
            if (index < 4) containerPromocao.innerHTML += cardHTML;
            else if (containerEstoque) containerEstoque.innerHTML += cardHTML;
        }
    });
}

// --- 2 FUNÇÃO DE ADICIONAR AO CARRINHO ---
function adicionarAoCarrinho(id) {
    //PROCURA EM PRODUTOSGLOBAIS O PRODUTO QUE CORRESPONDE AO ID, SE NÃO TIVER STOP
    const produto = produtosGlobais.find(p => p.id == id);
    if (!produto) return;

    //tenta procurar o carrinho antigo,s se não existir cria um novo []
    let carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];

    //BUSCA SE O ITEM JA ESTÁ NO CARRINHO
    const itemExistente = carrinho.find(item => item.id == id);
    if (itemExistente) { 
        itemExistente.quantidade = (itemExistente.quantidade || 1) + 1;
        alert(`Você agora possui  ${itemExistente.quantidade} unidades do item ${produto.name} no carrinho!`);
    } else {
        carrinho.push({ ...produto, quantidade: 1 }); // ... = ADD TODAS AS INFOS (NOME,IMG ETC) NO CARRINHO
        alert(`${produto.name} foi adicionado ao seu carrinho!`);
    }
    //Transforma o código (Array) de volta em TEXTO (String) para o navegador aceitar
    localStorage.setItem('carrinho_compras', JSON.stringify(carrinho));
    atualizarBadgeCarrinho();
   
}

// --- 3 FUNÇÃO MOSTRAR PAGINA DO CARRINHO ---
function carregarPaginaCarrinho() {

    //onde os cards serão desenhados
    const containerResumo = document.getElementById('resumo-carrinho');//LISTA SEM IMAGEM
    const elementoTotal = document.getElementById('total-carrinho'); // VALOR FINAL
    const listaCarrinho = document.getElementById('lista-carrinho'); //LISTA COM IMAGEM

    //caso não ache o container stop
    if (!containerResumo) return;

    //limpa a tela
    if (listaCarrinho) listaCarrinho.innerHTML = '';
    containerResumo.innerHTML = '';

    //recupera os dados ou cria uma lista vazia
    const carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];
    let precoTotal = 0; //var para somar o valor de todos os produtos

    //caso o carrinho esteja vazio
    if (carrinho.length === 0) {
        containerResumo.innerHTML = '<div class="alert alert-info">Seu carrinho está vazio.</div>';
        if (elementoTotal) { elementoTotal.innerText = 'R$ 0,00'; elementoTotal.dataset.valorProdutos = 0; }
        return;
    }

    //loop para cada produto no carrinho
    carrinho.forEach(item => {
        const qtd = item.quantidade || 1; //garantia contra quantidade -1
        const totalItem = parseFloat(item.price) * qtd; ///conversão de texto em numero
        precoTotal += totalItem;

        // Lista sem imagem
        containerResumo.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center lh-sm">
                <div>
                    <h6 class="my-0">${item.name}</h6>
                    <small class="text-muted">${qtd}x R$ ${parseFloat(item.price).toFixed(2)}</small>
                </div>
                <span class="text-muted">R$ ${totalItem.toFixed(2)}</span>
                <button class="btn btn-sm text-danger" onclick="removerDoCarrinho(${item.id})"><i class="fa fa-trash"></i></button>
            </li>
        `;
        
        // lista com imagem
        if (listaCarrinho) {
             listaCarrinho.innerHTML += `
                <div class="col-12 card mb-3 p-3 shadow-sm">
                    <div class="d-flex align-items-center">
                        <img src="${item.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;" onerror="this.src='https://via.placeholder.com/80'">
                        <div class="ms-3 flex-grow-1">
                            <h5 class="mb-1">${item.name}</h5>
                            <small class="text-muted">Unitário: R$ ${parseFloat(item.price).toFixed(2)}</small>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold mb-1">R$ ${totalItem.toFixed(2)}</div>
                            <span class="badge bg-secondary">Qtd: ${qtd}</span>
                        </div>
                    </div>
                </div>`;
        }
    });

    //att o valor final no card
    if (elementoTotal) {
        elementoTotal.innerText = precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        elementoTotal.dataset.valorProdutos = precoTotal; //guarda o numero para usar no frete
    }
}

// 4 FUNÇÃO REMOVER DO CARRINHO
//REMOVE PELO ID
function removerDoCarrinho(id) {

    //tenta recuperar a lista que ja existe ou cria uma nova
    let carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];
    carrinho = carrinho.filter(item => item.id != id); //CRIA NOVA LISTA COM ITENS QUE TEM ID DIFERENTE DO QUE PROCURA
    localStorage.setItem('carrinho_compras', JSON.stringify(carrinho)); //SALVA  A NOVA LISTA FILTRADA 
    //recarrega a pagina para mostrar a lista nova e att o icone do carrinho
    carregarPaginaCarrinho();
    atualizarBadgeCarrinho();
}



// --- 5 FUNÇÃO DO CÁLCULO DE FRETE ---
async function calcularFrete() {
    const cepInput = document.getElementById('input-cep'); //pega o cep que o user digita
    const divOpcoes = document.getElementById('opcoes-frete'); //div onde vai ficar as opções do frete

    // 1. Limpa o CEP para deixar só números
    let cep = cepInput.value.replace(/\D/g, ''); 

    if (cep.length !== 8) {
        alert("Por favor, digite um CEP válido (8 números).");
        return;
    }

    // Formata com tracinho para a API (ex: xxxxx-xxx) com expressão reg.
    cep = cep.replace(/^(\d{5})(\d{3})$/, "$1-$2"); //grupo de 5 e grupo de 3

    divOpcoes.innerHTML = '<div class="spinner-border spinner-border-sm text-primary"></div> <small>Consultando Correios...</small>';

    try {
        const resposta = await fetch(`${api_base_url}/frete`, { //monta o endereço para fazer requisção e enviar cep
            method: 'POST', //define o tipo de ação,envia os dados
            headers: { 'Content-Type': 'application/json' }, //rotulo, texto em formato de json
            body: JSON.stringify({ cep: cep }) //conteudo, pega o cep e transforma em string
        });

        if (!resposta.ok) throw new Error('Falha na consulta');
        //Transforma a resposta do servidor em objeto JS
        const dados = await resposta.json();
        let opcoesValid = []; // Cria uma lista vazia para guardar o resultado final

        // verifica se  a lista de frete veio correta e qual chave está a lista 
        if (Array.isArray(dados)) opcoesValid = dados;
        else if (dados.frete && Array.isArray(dados.frete)) opcoesValid = dados.frete;
        else if (dados.opcoes && Array.isArray(dados.opcoes)) opcoesValid = dados.opcoes;
        else {
            // Object.keys(dados) > cria uma lista com os nomes das chaves.
            const keys = Object.keys(dados);
            const arrayKey = keys.find(k => Array.isArray(dados[k])); //find() procura qualquer chave cujo valor seja um Array (Lista).
            if (arrayKey) opcoesValid = dados[arrayKey]; //usa a lista que achou
        }

        //se não encontrou a lista de frete
        divOpcoes.innerHTML = ''; //limpa o carregamento
        if (!opcoesValid || opcoesValid.length === 0) {
            divOpcoes.innerHTML = '<small class="text-warning">Nenhuma opção de entrega encontrada.</small>';
            return;
        }

        //se encontrou a lista de frete, desenha elas 
        opcoesValid.forEach((opcao, index) => {
            const valor = parseFloat(opcao.valor || opcao.price || 0); //lidar com os possiveis nomes do preço, nome e prazo do frete
            const tipo = opcao.tipo || opcao.name || 'Entrega';
            const prazo = opcao.prazo || opcao.deliveryTime || '?';

            //criação dos botoes de escolha dos fretes
            divOpcoes.innerHTML += `
                <div class="form-check mt-2">
                    <input class="form-check-input" type="radio" name="frete" id="frete-${index}" value="${valor}" onchange="atualizarTotalComFrete(${valor})">
                    <label class="form-check-label w-100 d-flex justify-content-between" for="frete-${index}">
                        <span>${tipo} - ${prazo} dias</span>
                        <strong>R$ ${valor.toFixed(2).replace('.', ',')}</strong>
                    </label>
                </div>
            `;
        });

    } catch (erro) {
        console.error("Erro Frete:", erro);
        divOpcoes.innerHTML = '<small class="text-danger">Erro ao calcular frete. Verifique o CEP.</small>';
    }
}

// --- 6 FUNÇÃO ATUALIZAR VALOR TOTAL COM FRETE ---

//função é acionada pelo evento onchange do input radio dos fretes
function atualizarTotalComFrete(valorFrete) {
    // Busca o elemento HTML que exibe o total
    const elTotal = document.getElementById('total-carrinho');
    const valorProdutos = parseFloat(elTotal.dataset.valorProdutos || 0); //recupera o valor ou define como 0
    const totalFinal = valorProdutos + parseFloat(valorFrete); //soma valor total + frete

    //atualiza o valor na tela, convertido em real
    elTotal.innerText = totalFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    localStorage.setItem('frete_escolhido', valorFrete); // Salva o valor do frete escolhido no navegador para depois ver em meuspedidos
}

// --- 7 FUNÇÃO FINALIZAR PEDIDO ---
function finalizarPedido() {

    //RECUPERA O CARRINHO DO LOCALSTORAGE
    const carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];
    //CASO ESTEJA VAZIO
    if (carrinho.length === 0) { alert("Seu carrinho está vazio!"); return; }

    //RECUPERA O FRETE ESCOLHIDO QUE FOI SALVO NO NAVEGDOR, CONVERTENDO DE VOLTA
    const frete = parseFloat(localStorage.getItem('frete_escolhido') || 0);

    //CALCULA O TOTAL DOS PRODUTOS
    //.reduce() executa uma função redutora para cada elemento do array,
    //acc >começa com 0, Guarda a soma das voltas anteriores; item: O produto atual sendo processado.
    // Multiplica preço x quantidade de cada item e soma ao acumulador.
    const totalProd = carrinho.reduce((acc, item) => acc + (parseFloat(item.price) * (item.quantidade || 1)), 0);

    ///construção do objeto pedido
    const novoPedido = {
        id: Math.floor(Math.random() * 10000) + 1000, //ID DO PEDIDO ALEATORIO
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR'),
        // Salva uma cópia do carrinho atual dentro do pedido.
        itens: carrinho,
        frete: frete,
        total: totalProd + frete
    };

    // Ler o histórico antigo antes de salvar para não apagar os pedidos anteriores
    let historico = JSON.parse(localStorage.getItem('meus_pedidos')) || [];
    historico.push(novoPedido); // add o novo pedido ao final da lista
    localStorage.setItem('meus_pedidos', JSON.stringify(historico)); //Sobrescrever o histórico no localStorage com a lista atualizada.

    //limpa o carrinho e frete após compra finalizada
    localStorage.removeItem('carrinho_compras');
    localStorage.removeItem('frete_escolhido');

    window.location.href = 'sucesso-pedido.html';
}

// --- 8 FUNÇÃO PARA CONFIGURAR BUSCA----------


//conecta o campo de pesquisa com a vitrine de produtos
function configurarBusca() {
    const formBusca = document.getElementById('form-busca');
    if (formBusca) { //SE O FORM EXISTIR NA PAGINA, FICA ESCUTANDO/AGUARDANDO
        formBusca.addEventListener('submit', (event) => { //dispara quando o user clica em lupa/enter
            event.preventDefault(); //prevenir que a pagina recarregue
            const termo = document.getElementById('input-busca').value.toLowerCase(); //pega o termo e converte em lowercase
            
            // Busca na lista global carregada da API o termo
            const filtrados = produtosGlobais.filter(p => 
                p.name.toLowerCase().includes(termo) ||  //procura no nome do produto || na descrição
                (p.description && p.description.toLowerCase().includes(termo))
            );

            //chama a função de carregarprodutos passando a lista filtrada
            carregarProdutos(filtrados);
        });
    }
}

// --- 9 FUNÇÃO PARA LISTAR O HISTÓRICO DE PEDIDOS -------
function carregarMeusPedidos() {
    const container = document.getElementById('lista-pedidos');
    const msg = document.getElementById('mensagem-vazio');
    if (!container) return;

    //TENTA RECUPERAR OS DADOS OU CRIA UMA LISTA VAZIA
    const pedidos = JSON.parse(localStorage.getItem('meus_pedidos')) || [];
    //SE ESTIVER VAZIA, PROCURA O AVISO (MSG) E O TORNA VISIVEL
    if (pedidos.length === 0) {
         if (msg) msg.classList.remove('d-none'); return; }

    //DESENHA OS PEDIDOS ONDE O MAIS RECENTE APARECE PRIMEIRO
    container.innerHTML = '';
    pedidos.reverse().forEach(p => {
        container.innerHTML += `
            <div class="col-12 mb-3">
                <div class="card shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center bg-light">
                        <div><strong>Pedido #${p.id}</strong> <span class="text-muted ms-2">${p.data}</span></div>
                        <span class="badge bg-success">Concluído</span>
                    </div>
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-0 text-primary">R$ ${parseFloat(p.total).toFixed(2)}</h5>
                            <small class="text-muted">${p.itens.length} itens</small>
                        </div>
                        <a href="pedido.html?id=${p.id}" class="btn btn-outline-primary btn-sm">Ver Detalhes</a>
                    </div>
                </div>
            </div>`;
    });
}

//--- 10 FUNÇÃO PARA EXIBIR OS  DETALHES DO PEDIDO  --

//LÊ A URL PARA SABER QUAL PEDIDO EXIBIR
function carregarDetalhesPedido() {
    const elId = document.getElementById('detalhe-id'); //Procura no HTML um elemento que tenha id="detalhe-id"
    if (!elId) return; //NAO ACHA O ID SE NÃO ESTIVER NA PAGINA QUE O CONTEM
 
    //SENDO URLSearchParams uma ferramenta nativa do navegador, para ler "?id=1234" DA URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); //PEGA APENAS O ID QUE A FERRAMENTA ENCONTROU

    //BUSCA O PEDIDO ESPECIFICO  NA LISTA 0PELO SEU ID
    const pedidos = JSON.parse(localStorage.getItem('meus_pedidos')) || [];
    const pedido = pedidos.find(p => p.id == id);

    //SE NAO ACHAR O PEDIDO
    if (!pedido) { alert("Pedido não encontrado"); window.location.href='meus_pedidos.html'; return; }

    //PREENCHE OS DADOS NA TELA
    elId.innerText = pedido.id;
    document.getElementById('detalhe-data').innerText = pedido.data;
    if(document.getElementById('detalhe-hora')) document.getElementById('detalhe-hora').innerText = pedido.hora || '';
    document.getElementById('detalhe-frete').innerText = `R$ ${parseFloat(pedido.frete).toFixed(2)}`;
    document.getElementById('detalhe-total').innerText = `R$ ${parseFloat(pedido.total).toFixed(2)}`;

    //PARA LISTAR OS ITENS COMPRADOS
    const lista = document.getElementById('detalhe-itens'); //PEGA A LISTA E LIMPA ELA
    lista.innerHTML = '';
    pedido.itens.forEach(item => {//PARA CADA ITEM NA LISTA É ADD O TEXTO HTML CORRESPONDENTE
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; margin-right:15px;">
                    <div><h6 class="mb-0">${item.name}</h6><small>${item.quantidade}x R$ ${parseFloat(item.price).toFixed(2)}</small></div>
                </div>
                <span>R$ ${(parseFloat(item.price) * item.quantidade).toFixed(2)}</span>
            </li>`;
    });
}

/* ==========================================================================
   FLUXO A: LOGIN, CADASTRO E DADOS 
   ========================================================================== */

// --- EXTRAS: FUNÇÕES QUE FALTAVAM ---

// 1. Atualiza o Header com o nome do usuário
function atualizarCabecalho() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));
    // Procura elementos do menu (ajuste os seletores se necessário)
    const nomeUsuario = document.querySelector('.navbar-nav .dropdown-toggle');

    if (usuarioLogado && nomeUsuario) {
        nomeUsuario.innerText = `Olá, ${usuarioLogado.nome ? usuarioLogado.nome.split(' ')[0] : 'Cliente'}!`;
    }
}

/// FUNÇÃO ATT BOLINHA 
function atualizarBadgeCarrinho() {
    //VAI NO NAVEGADOR E PEGA A LISTA DE COMPRAS
    const carrinho = JSON.parse(localStorage.getItem('carrinho_compras')) || [];
    //SOMAR A QUANTIDADE DE CADA ITEM NO CARRINHO
    const totalItens = carrinho.reduce((acc, item) => acc + (item.quantidade || 1), 0);

    // Procura o elemento pelo ID no HTML (HEADER)
    const badge = document.getElementById('badge-carrinho');
 
    //SE A BOLINHA EXISTIR, ESCREVE O NR TOTAL DENTRO DELA
    if (badge) {
        badge.innerText = totalItens;
    }
}

// 3. Logout
function fazerLogout() {
    localStorage.removeItem('usuario_logado');
    window.location.href = 'login.html';
}


/* =========================
    CONFIGURAÇÕES E LOGIN
========================= */
// Função assíncrona para processar o login do usuário
async function realizarLogin(event) {
    // Impede o recarregamento padrão da página ao enviar o formulário
    event.preventDefault();

    // Captura o email (removendo espaços vazios) e a senha dos campos de entrada
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    try {
        // Faz uma requisição POST para a API de login com os dados informados
        const resposta = await fetch('https://ppw-1-tads.vercel.app/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        // Converte a resposta do servidor para um objeto JSON
        const dados = await resposta.json();

        // Verifica se a resposta falhou ou se o sucesso é explicitamente falso
        if (!resposta.ok || dados.success === false) {
            // Exibe mensagem de erro da API ou uma mensagem padrão
            alert(dados.message || 'Usuário ou senha inválidos.');
            return;
        }

        // Armazena os dados do usuário e o token de acesso no localStorage do navegador
        localStorage.setItem('usuario_logado', JSON.stringify({
            nome: dados.user?.nome || email.split('@')[0], // Usa o nome da API ou a parte antes do @ do email
            email: email,
            token: dados.token,
            cpf: dados.user?.cpf || '',
            dataNascimento: dados.user?.dataNascimento || '',
            telefone: dados.user?.telefone || ''
        }));

        // Notifica o sucesso e redireciona para a página de produtos
        alert('Login realizado com sucesso!');
        window.location.assign('produtos.html');

    } catch (erro) {
        // Trata falhas de rede ou erros inesperados
        console.error("Erro:", erro);
        alert('Erro de conexão com o servidor.');
    }
}

// Função assíncrona para registrar um novo usuário
async function realizarCadastro(event) {
    // Evita o comportamento padrão de submit do formulário
    event.preventDefault();
    // Coleta os valores digitados pelo usuário
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    // Validação local: as senhas devem coincidir
    if (senha !== confirmarSenha) {
        alert('As senhas não são idênticas.');
        return;
    }

    try {
        // Envia os dados de cadastro para o servidor via POST
        const resposta = await fetch('https://ppw-1-tads.vercel.app/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, confirmacaoSenha: confirmarSenha })
        });

        // Converte o resultado para JSON
        const dados = await resposta.json();

        // Verifica se houve erro no cadastro retornado pelo servidor
        if (!resposta.ok || dados.success === false) {
            alert(dados.message || 'Erro ao realizar cadastro.');
            return;
        }

        // Sucesso no registro: avisa o usuário e manda para a tela de login
        alert('Usuário registrado com sucesso!');
        window.location.href = 'login.html';
    } catch (erro) {
        // Tratamento de erro em caso de falha na comunicação
        alert('Erro ao conectar com o servidor.');
    }
}

/* =========================
    DADOS DO USUÁRIO
========================= */
// Preenche as informações do perfil na tela
function carregarDadosPessoais() {
    // Recupera a string de dados do usuário logado
    const userData = localStorage.getItem('usuario_logado');

    // Se não houver dados, redireciona para login (proteção básica de rota)
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }

    // Transforma a string de volta em objeto JavaScript
    const user = JSON.parse(userData);

    // Seleciona os campos de input da página de dados pessoais
    const campoNome = document.getElementById('dp-nome');
    const campoEmail = document.getElementById('dp-email');
    // Preenche os valores se os elementos existirem no HTML atual
    if (campoNome) campoNome.value = user.nome || '';
    if (campoEmail) campoEmail.value = user.email || '';

    
}

// Limpa a sessão e desloga o usuário
function fazerLogout() {
    // Remove a chave do usuário do armazenamento local
    localStorage.removeItem('usuario_logado');
    // Redireciona para a página principal
    window.location.href = 'PaginaInicial.html';
}

// Ajusta os links do menu dependendo se o usuário está logado ou não
function atualizarHeaderDinamico() {
    // Verifica se há um objeto de usuário no localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario_logado'));
    const saudacao = document.getElementById('texto-saudacao');

    // Lista de elementos que só devem aparecer para usuários LOGADOS
    const itensLogado = [
        document.getElementById('menu-produtos'),
        document.getElementById('menu-dados'),
        document.getElementById('menu-enderecos'),
        document.getElementById('menu-pedidos'),
        document.getElementById('menu-logout'),
        document.querySelector('.divider-logado')
    ];

    // Lista de elementos que só devem aparecer para usuários NÃO LOGADOS
    const itensDeslogado = [
        document.getElementById('menu-cadastro'),
        document.getElementById('menu-login')
    ];

    if (usuario) {
        // --- USUÁRIO LOGADO ---
        // Personaliza a saudação com o primeiro nome
        if (saudacao) saudacao.innerText = `Olá, ${usuario.nome.split(' ')[0]}!`;

        // Esconde os links de login/cadastro usando a classe Bootstrap 'd-none'
        itensDeslogado.forEach(el => el?.classList.add('d-none'));//Para cada item do array itensDeslogado, 
        // se o elemento existir, adicione a classe d-none para escondê-lo.”

        // Mostra as opções exclusivas de quem está logado
        itensLogado.forEach(el => el?.classList.remove('d-none'));

    } else {
        // --- USUÁRIO DESLOGADO ---
        // Retorna a saudação padrão
        if (saudacao) saudacao.innerText = "Olá, seja bem-vindo!";

        // Mostra opções de acesso (Login/Cadastro)
        itensDeslogado.forEach(el => el?.classList.remove('d-none'));

        // Esconde as opções de gerenciamento de conta
        itensLogado.forEach(el => el?.classList.add('d-none'));
    }
}

/* =========================
    ENDEREÇOS
========================= */
// Renderiza a lista de endereços salvos localmente
function carregarEnderecos() {
    const listaDiv = document.getElementById('lista-enderecos');
    if (!listaDiv) return; // Sai se a página não tiver o container de lista

    // Pega a lista de endereços do localStorage ou inicia um array vazio
    const enderecos = JSON.parse(localStorage.getItem('enderecos')) || [];

    // Se não houver nada, exibe mensagem informativa
    if (enderecos.length === 0) {
        listaDiv.innerHTML = '<p class="text-muted">Nenhum endereço cadastrado.</p>';
        return;
    }

    // Cria os cards HTML para cada endereço usando a função map
    listaDiv.innerHTML = enderecos.map((end, index) => `
        <div class="card mb-3 shadow-sm">
            <div class="card-body">
                <p class="mb-1"><strong>${end.rua}, ${end.numero}</strong></p>
                <p class="small mb-2">${end.cidade} - CEP: ${end.cep}</p>
                <button onclick="excluirEndereco(${index})" class="btn btn-sm btn-outline-danger">Excluir</button>
            </div>
        </div>
    `).join(''); // Converte o array resultante em uma string única
}

// Salva um novo endereço no localStorage
function cadastrarEndereco() {
    // Captura os valores dos inputs do formulário de endereço
    const rua = document.getElementById('rua').value;
    const numero = document.getElementById('numero').value;
    const cep = document.getElementById('cep').value;
    const cidade = document.getElementById('cidade').value;

    // Validação básica de preenchimento
    if (!rua || !numero || !cep || !cidade) {
        alert('Preencha todos os campos.');
        return;
    }

    // Busca lista atual, adiciona o novo e salva novamente
    const enderecos = JSON.parse(localStorage.getItem('enderecos')) || [];
    enderecos.push({ rua, numero, cep, cidade });
    localStorage.setItem('enderecos', JSON.stringify(enderecos));
    // Recarrega a página para atualizar a lista visual
    location.reload();
}

// Remove um endereço específico pelo índice
function excluirEndereco(index) {
    // Pede confirmação antes de apagar
    if (confirm('Excluir este endereço?')) {
        let enderecos = JSON.parse(localStorage.getItem('enderecos')) || [];
        // Remove 1 item na posição informada
        enderecos.splice(index, 1);
        // Atualiza o banco local
        localStorage.setItem('enderecos', JSON.stringify(enderecos));
        // Recarrega apenas a lista visualmente
        carregarEnderecos();
    }
}

// --- INICIALIZAÇÃO  ---
document.addEventListener('DOMContentLoaded', () => { // Esse evento dispara quando o HTML termina de carregar
    // Fluxo B
    // Antes de chamar uma função, verifica se ela realmente existe
    if(typeof carregarProdutos === 'function') carregarProdutos();
    if(typeof carregarPaginaCarrinho === 'function') carregarPaginaCarrinho();
    if(typeof carregarMeusPedidos === 'function') carregarMeusPedidos();
    if(typeof carregarDetalhesPedido === 'function') carregarDetalhesPedido();
    if(typeof configurarBusca === 'function') configurarBusca();
    
    // Fluxo A
    //
    if(document.getElementById('form-login')) document.getElementById('form-login').addEventListener('submit', realizarLogin);
    if(document.getElementById('form-cadastro')) document.getElementById('form-cadastro').addEventListener('submit', realizarCadastro);
    
    // Globais
    atualizarHeaderDinamico(); //SE TIVER USER LOGADO, SAUDAÇÃO COM NOME DELE
    atualizarBadgeCarrinho(); //ATUALIZA DE ACORDO COM QUANTOS ITENS TEM NO CARRINHO
    
    // Dados e Endereços
    if(typeof carregarDadosPessoais === 'function' && document.getElementById('dp-nome')) carregarDadosPessoais();
    if(typeof carregarEnderecos === 'function' && document.getElementById('lista-enderecos')) carregarEnderecos();
    
    // Patch de Dados
    const formDados = document.getElementById('form-dados-pessoais');
    if(formDados) {
        formDados.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Lógica de atualização
            alert('Dados atualizados localmente!');
        });
    }
});