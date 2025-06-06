const API_URL = "http://localhost:3000/filmes";

async function buscarFilmes() {
  try {
    const resposta = await fetch(API_URL);
    return await resposta.json();
  } catch (erro) {
    console.error("Erro ao buscar filmes:", erro);
    return [];
  }
}

async function carregarHome() {
  const destaque = document.getElementById("destaqueFilmes");
  const lista = document.getElementById("listaFilmes");

  const filmes = await buscarFilmes();

  if (destaque) {
    destaque.innerHTML = "";
    let primeiro = true;
    filmes.filter(f => f.destaque).forEach(filme => {
      destaque.innerHTML += `
        <div class="carousel-item ${primeiro ? 'active' : ''}">
          <img src="${filme.imagemPrincipal}" class="d-block w-100">
          <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
            <h5>${filme.titulo}</h5>
            <p>${filme.descricao}</p>
          </div>
        </div>
      `;
      primeiro = false;
    });
  }

  if (lista) {
    lista.innerHTML = "";
    filmes.forEach(filme => {
      lista.innerHTML += `
      <div class="col-md-4 mb-4" data-id="${filme.id}">
        <div class="card h-100 shadow-sm">
          <img src="${filme.imagemPrincipal}" class="card-img-top">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${filme.titulo}</h5>
            <p class="card-text">${filme.descricao}</p>
            <div class="mt-auto d-flex justify-content-between">
              <a href="detalhe.html?id=${filme.id}" class="btn btn-outline-primary btn-sm">Ver Detalhes</a>
              <a href="cadastro_filmes.html?id=${filme.id}" class="btn btn-outline-primary btn-sm">Editar</a>
              <button class="btn btn-danger btn-sm btnExcluir" data-id="${filme.id}">Excluir</button>
            </div>
          </div>
        </div>
      </div>
    `;
    });

    adicionarEventosExcluir();
  }
}

function adicionarEventosExcluir() {
  const botoesExcluir = document.querySelectorAll(".btnExcluir");
  botoesExcluir.forEach(botao => {
    botao.addEventListener("click", async (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      if (confirm("Tem certeza que deseja excluir este filme?")) {
        try {
          const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
          if (resposta.ok) {
            alert("Filme excluído com sucesso!");
            carregarHome();
          } else {
            alert("Erro ao excluir filme.");
          }
        } catch (erro) {
          alert("Erro ao excluir filme.");
          console.error("Erro no DELETE:", erro);
        }
      }
    });
  });
}

async function carregarDetalhes() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  try {
    const resposta = await fetch(`${API_URL}/${id}`);
    const filme = await resposta.json();

    const info = document.getElementById("infoFilme");
    const fotos = document.getElementById("fotosFilme");

    if (!filme || !info || !fotos) return;

    info.innerHTML = `
      <div class="row align-items-center">
        <div class="col-md-6">
          <img src="${filme.imagemPrincipal}" class="img-fluid rounded shadow">
        </div>
        <div class="col-md-6">
          <h2>${filme.titulo}</h2>
          <p><strong>Diretor:</strong> ${filme.diretor}</p>
          <p><strong>Ano:</strong> ${filme.ano}</p>
          <p><strong>Gênero:</strong> ${filme.genero}</p>
          <p>${filme.descricao}</p>
        </div>
      </div>
    `;

    fotos.innerHTML = "";
    if (Array.isArray(filme.fotosExtras)) {
      filme.fotosExtras.forEach(foto => {
        fotos.innerHTML += `
          <div class="col-md-3 mb-3">
            <div class="card shadow-sm">
              <img src="${foto.imagem}" class="card-img-top">
              <div class="card-body">
                <p class="card-text">${foto.legenda}</p>
              </div>
            </div>
          </div>
        `;
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar detalhes do filme:", erro);
  }
}

async function carregarFormulario() {
  const form = document.getElementById("formFilme");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    try {
      const resposta = await fetch(`${API_URL}/${id}`);
      const filme = await resposta.json();

      form.titulo.value = filme.titulo || "";
      form.descricao.value = filme.descricao || "";
      form.imagem.value = filme.imagemPrincipal || "";
      form.genero.value = filme.genero || "";
      form.ano.value = filme.ano || "";
      form.diretor.value = filme.diretor || "";

      if (Array.isArray(filme.fotosExtras)) {
        filme.fotosExtras.forEach(foto => adicionarFotoExtra(foto.imagem, foto.legenda));
      }
    } catch (erro) {
      console.error("Erro ao carregar filme para edição:", erro);
    }
  }

  document.getElementById("btnSalvar").addEventListener("click", async function (e) {
    e.preventDefault();

    const fotosExtras = [];
    document.querySelectorAll(".foto-extra").forEach(div => {
      const url = div.querySelector(".input-url")?.value.trim();
      const legenda = div.querySelector(".input-legenda")?.value.trim();
      if (url) fotosExtras.push({ imagem: url, legenda });
    });

    const dadosFilme = {
      titulo: form.titulo.value,
      descricao: form.descricao.value,
      imagemPrincipal: form.imagem.value,
      genero: form.genero.value,
      ano: Number(form.ano.value),
      diretor: form.diretor.value,
      destaque: false,
      fotosExtras: fotosExtras
    };

    const url = id ? `${API_URL}/${id}` : API_URL;
    const metodo = id ? "PUT" : "POST";

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosFilme)
      });

      if (!resposta.ok) throw new Error();

      alert(id ? "Filme atualizado com sucesso!" : "Filme cadastrado com sucesso!");
      window.location.href = "index.html";

    } catch (erro) {
      console.error("Erro ao salvar filme:", erro);
      alert("Erro ao salvar filme.");
    }
  });
}

function adicionarFotoExtra(url = "", legenda = "") {
  const container = document.getElementById("fotosExtrasContainer");
  if (!container) return;

  const div = document.createElement("div");
  div.classList.add("row", "mb-3", "foto-extra");

  div.innerHTML = `
    <div class="col-md-5 mb-2">
      <input type="url" class="form-control input-url" placeholder="URL da imagem" value="${url}">
    </div>
    <div class="col-md-5 mb-2">
      <input type="text" class="form-control input-legenda" placeholder="Legenda" value="${legenda}">
    </div>
    <div class="col-md-2 mb-2 d-flex align-items-center">
      <button type="button" class="btn btn-danger btnRemoverFoto w-100">Remover</button>
    </div>
  `;

  container.appendChild(div);

  div.querySelector(".btnRemoverFoto").addEventListener("click", () => {
    container.removeChild(div);
  });
}

// Detectar qual página está sendo acessada
if (document.getElementById("listaFilmes")) carregarHome();
if (document.getElementById("infoFilme")) carregarDetalhes();
if (document.getElementById("formFilme")) carregarFormulario();
