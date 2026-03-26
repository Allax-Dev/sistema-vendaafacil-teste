function irPara(pagina) {
  if (pagina === "painel") carregarPainel();
  if (pagina === "produtos") carregarProdutos();
  if (pagina === "clientes") carregarClientes();
  if (pagina === "vendas") carregarVendas();
}

let produtos = [], clientes = [], vendas = [], itensVenda = [];

window.onload = () => carregarPainel();


function carregarPainel() {
  Promise.all([
    fetch('http://localhost:3000/produtos').then(res => res.json()),
    fetch('http://localhost:3000/clientes').then(res => res.json()),
    fetch('http://localhost:3000/vendas').then(res => res.json())
  ]).then(([produtosData, clientesData, vendasData]) => {
    produtos = produtosData;
    clientes = clientesData;
    vendas = vendasData;
    const faturamento = vendas.reduce((t, v) => t + Number(v.total), 0);
    document.getElementById("conteudo").innerHTML = `
      <div class="container">
        <h2>📊 Painel</h2>
        <div class="cards">
          <div class="card"><h3>Produtos</h3><p>${produtos.length}</p></div>
          <div class="card"><h3>Clientes</h3><p>${clientes.length}</p></div>
          <div class="card"><h3>Vendas</h3><p>${vendas.length}</p></div>
          <div class="card"><h3>Faturamento</h3><p>R$ ${faturamento.toFixed(2)}</p></div>
        </div>
      </div>
    `;
  });
}


function carregarProdutos() {
  document.getElementById("conteudo").innerHTML = `
    <div class="container">
      <h2>📦 Produtos</h2>
      <input id="nomeProduto" placeholder="Nome" />
      <input id="precoProduto" type="number" placeholder="Preço" />
      <button onclick="adicionarProduto()">Salvar</button>
      <ul id="listaProdutos"></ul>
    </div>
  `;
  buscarProdutos();
}

function buscarProdutos() {
  fetch('http://localhost:3000/produtos')
    .then(res => res.json())
    .then(data => { produtos = data; renderizarProdutos(); });
}

function renderizarProdutos() {
  const lista = document.getElementById("listaProdutos");
  if (!lista) return;
  lista.innerHTML = "";
  produtos.forEach(p => {
    lista.innerHTML += `
      <li>
        <span>${p.nome} - R$ ${Number(p.preco).toFixed(2)}</span>
        <div class="acoes">
          <button class="editar" onclick="editarProduto(${p.id})">Editar</button>
          <button class="excluir" onclick="removerProduto(${p.id})">Excluir</button>
        </div>
      </li>
    `;
  });
}

function adicionarProduto() {
  const nome = document.getElementById("nomeProduto").value;
  const preco = parseFloat(document.getElementById("precoProduto").value);
  if (!nome || preco <= 0) return;
  fetch('http://localhost:3000/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, preco })
  }).then(() => buscarProdutos());
}

function editarProduto(id) {
  const p = produtos.find(p => p.id == id);
  const nome = prompt("Nome:", p.nome);
  const preco = parseFloat(prompt("Preço:", p.preco));
  if (!nome || preco <= 0) return;
  fetch(`http://localhost:3000/produtos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, preco })
  }).then(() => buscarProdutos());
}

function removerProduto(id) {
  fetch(`http://localhost:3000/produtos/${id}`, { method: 'DELETE' })
    .then(() => buscarProdutos());
}


function carregarClientes() {
  document.getElementById("conteudo").innerHTML = `
    <div class="container">
      <h2>👤 Clientes</h2>
      <input id="nomeCliente" placeholder="Nome" />
      <input id="docCliente" placeholder="CPF/CNPJ" />
      <button onclick="adicionarCliente()">Salvar</button>
      <ul id="listaClientes"></ul>
    </div>
  `;
  buscarClientes();
}

function buscarClientes() {
  fetch('http://localhost:3000/clientes')
    .then(res => res.json())
    .then(data => { clientes = data; renderizarClientes(); });
}

function renderizarClientes() {
  const lista = document.getElementById("listaClientes");
  if (!lista) return;
  lista.innerHTML = "";
  clientes.forEach(c => {
    lista.innerHTML += `
      <li>
        <span>${c.nome} - ${c.doc}</span>
        <div class="acoes">
          <button class="editar" onclick="editarCliente(${c.id})">Editar</button>
          <button class="excluir" onclick="removerCliente(${c.id})">Excluir</button>
        </div>
      </li>
    `;
  });
}

function adicionarCliente() {
  const nome = document.getElementById("nomeCliente").value;
  const doc = document.getElementById("docCliente").value;
  if (!nome || !doc) return;
  fetch('http://localhost:3000/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, doc })
  }).then(() => buscarClientes());
}

function editarCliente(id) {
  const c = clientes.find(c => c.id == id);
  const nome = prompt("Nome:", c.nome);
  const doc = prompt("Documento:", c.doc);
  if (!nome || !doc) return;
  fetch(`http://localhost:3000/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, doc })
  }).then(() => buscarClientes());
}

function removerCliente(id) {
  fetch(`http://localhost:3000/clientes/${id}`, { method: 'DELETE' })
    .then(() => buscarClientes());
}


function carregarVendas() {
  document.getElementById("conteudo").innerHTML = `
    <div class="container">
      <h2>🧾 Vendas</h2>

      <div class="form-venda">
        <div class="campo">
          <label>Cliente:</label>
          <select id="clienteVenda"></select>
        </div>
        <div class="campo">
          <label>Produto:</label>
          <select id="produtoVenda"></select>
        </div>
        <div class="campo">
          <label>Qtd:</label>
          <input id="quantidadeProduto" type="number" placeholder="Qtd" min="1" />
        </div>
        <div class="campo">
          <button class="adicionar" onclick="adicionarItem()">Adicionar</button>
        </div>
      </div>

      <ul id="listaItens"></ul>

      <div class="resumo-venda">
        <span>Total: R$ <strong id="totalVenda">0.00</strong></span>
        <button class="finalizar" onclick="finalizarVenda()">Finalizar Venda</button>
      </div>

      <ul id="listaVendas"></ul>
    </div>
  `;

  buscarClientes();
  buscarProdutos();
  buscarVendas();
  setTimeout(carregarSelects, 300);
}

function carregarSelects() {
  document.getElementById("clienteVenda").innerHTML =
    clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join("");
  document.getElementById("produtoVenda").innerHTML =
    produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join("");
}

function adicionarItem() {
  const id = document.getElementById("produtoVenda").value;
  const qtd = parseInt(document.getElementById("quantidadeProduto").value);
  const p = produtos.find(p => p.id == id);
  itensVenda.push({ ...p, quantidade: qtd });
  renderizarItens();
}

function renderizarItens() {
  const lista = document.getElementById("listaItens");
  if (!lista) return;
  let total = 0;
  lista.innerHTML = "";
  itensVenda.forEach((i, idx) => {
    total += i.preco * i.quantidade;
    lista.innerHTML += `<li>${i.nome} x${i.quantidade} 
      <button onclick="removerItem(${idx})">X</button></li>`;
  });
  document.getElementById("totalVenda").innerText = total.toFixed(2);
}

function removerItem(i) {
  itensVenda.splice(i, 1);
  renderizarItens();
}

function finalizarVenda() {
  const cliente_id = document.getElementById("clienteVenda").value;
  fetch('http://localhost:3000/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cliente_id,
      itens: itensVenda.map(i => ({
        produto_id: i.id,
        quantidade: i.quantidade,
        preco: i.preco
      }))
    })
  }).then(() => {
    itensVenda = [];
    renderizarItens();
    buscarVendas();
  });
}

function buscarVendas() {
  fetch('http://localhost:3000/vendas')
    .then(res => res.json())
    .then(data => { vendas = data; renderizarVendas(); });
}

function renderizarVendas() {
  const lista = document.getElementById("listaVendas");
  if (!lista) return;
  lista.innerHTML = "";
  vendas.forEach(v => {
    lista.innerHTML += `
      <li>
        ${v.cliente} - R$ ${Number(v.total).toFixed(2)}
        <div class="acoes">
          <button class="editar" onclick="editarVenda(${v.id})">Editar</button>
          <button class="excluir" onclick="removerVenda(${v.id})">Excluir</button>
        </div>
      </li>
    `;
  });
}

function removerVenda(id) {
  fetch(`http://localhost:3000/vendas/${id}`, { method: 'DELETE' })
    .then(() => buscarVendas());
}

function editarVenda(id) {
  const cliente_id = prompt("Novo cliente ID:");
  if (!cliente_id) return;
  fetch(`http://localhost:3000/vendas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cliente_id })
  }).then(() => buscarVendas());
}