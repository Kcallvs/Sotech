function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
const csrftoken = getCookie('csrftoken');


// BUSCAR ESTOQUE (GET)
async function estoque_pegue(string_de_busca = "", lista, total) {
    try {
        const params = new URLSearchParams();

        if (string_de_busca !== "") {
            params.append("q", string_de_busca);
        }

        const resposta = await fetch(`/pegar_estoque/?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const resultado = await resposta.json();

        if (resultado.sucesso) {
            renderizar_lista(resultado.lista, lista);
            total.innerHTML = resultado.len;
            vencendo.innerHTML = resultado.validade;
            critico.innerHTML = resultado.critico;
        } else {
            alert(resultado.erro || "Erro ao pegar dados");
        }
    } catch (erro) {
        console.error(erro);
        alert("erro ao carregar o estoque");
    }
}



// VERIFICAR VALIDADE 
function verificarValidade(dataValidade) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const partes = dataValidade.split("-");
    const validade = new Date(partes[0], partes[1] - 1, partes[2]);
    const diferenca = validade - hoje;
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

    if (dias < 0) {
        return ["critico", "badge red"];
    }

    if (dias <= 7) {
        return ["vencendo", "badge yellow"];
    }

    return ["normal", "badge green"];
}


// RENDERIZAR LISTA (com data-id e novos botões)
function renderizar_lista(_info, lista) {
    let string = "";

    _info.forEach(estoque => {
        const [texto, classe] = verificarValidade(estoque.validade);

        string += `<tr data-id="${estoque.id}">
              <td>
                <strong>${estoque.nome}</strong>
              </td>
              <td>${estoque.categoria}</td>
              <td>${estoque.quantidade} un</td>
              <td>${estoque.tamanho_estoque} un</td>
              <td>${estoque.lote}</td>
              <td>${estoque.validade}</td>
              <td>
                <span class="${classe}">${texto}</span>
              </td>

              <td>
                <button class="btn-edit"><i class="fas fa-edit"></i></button>
                <button class="btn-delete"><i class="fas fa-trash"></i></button>
              </td>
            </tr>`;
    });
    lista.innerHTML = string;
}


document.addEventListener("DOMContentLoaded", () => {

    const tabela = document.querySelector(".inventory-table tbody");
    const busca = document.querySelector(".search-input");

    const itensCriticos = document.querySelector(".summary-card:nth-child(1) strong");
    const itensVencendo = document.querySelector(".summary-card:nth-child(2) strong");
    const totalItens = document.querySelector(".summary-card:nth-child(3) strong");

    const lista_items = document.getElementById('estoque_lista');

    const total = document.getElementById("total");
    const critico = document.getElementById("critico");
    const vencendo = document.getElementById("vencendo");

    // controla se o modal está em modo edição
    let modoEdicao = false;
    let idEditando = null;

    lista_items.innerHTML = "";

    estoque_pegue("", lista_items, total);



    // FILTRO DE BUSCA

    busca.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            estoque_pegue(busca.value, lista_items, total);
        }
    });



    // ATUALIZAR RESUMO

    function atualizarResumo() {
        const linhas = document.querySelectorAll(".inventory-table tbody tr");

        let criticos = 0;
        let vencendo = 0;

        linhas.forEach(linha => {
            const status = linha.querySelector(".badge").textContent;

            if (status.includes("Crítico")) criticos++;
            if (status.includes("Vencendo")) vencendo++;
        });

        itensCriticos.textContent = criticos;
        itensVencendo.textContent = vencendo;
        totalItens.textContent = linhas.length;
    }

    atualizarResumo();



    // ATUALIZAR QUANTIDADE (sync)

    tabela.addEventListener("click", (e) => {
        const botao = e.target.closest(".fa-sync-btn");

        if (!botao) return;

        const linha = botao.closest("tr");

        let qtd = linha.children[2].textContent;
        qtd = parseInt(qtd);

        const novaQtd = prompt("Nova quantidade:", qtd);

        if (novaQtd !== null) {
            linha.children[2].textContent = novaQtd + " un";
            // Se quiser persistir isso no banco, dá pra chamar aqui
            // um fetch parecido com o de editar, enviando só a quantidade.
        }
    });



    // MODAL - ENTRADA / EDIÇÃO DE MATERIAL

    const btnEntrada = document.getElementById("btnEntrada");
    const modal = document.getElementById("modalCliente");
    const btnCancelar = document.getElementById("btnCancelar");
    const form = document.getElementById("formEntrada");
    const modalTitulo = document.getElementById("modalTitulo"); // AJUSTAR: adicionar id="modalTitulo" no <h2> do modal
    const btnSalvar = document.getElementById("btnSalvar");     // AJUSTAR: adicionar id="btnSalvar" no botão de salvar

    if (!btnEntrada) console.error('Elemento #btnEntrada não encontrado no HTML.');
    if (!modal) console.error('Elemento #modalCliente não encontrado no HTML.');
    if (!btnCancelar) console.error('Elemento #btnCancelar não encontrado no HTML.');

    function abrirModalCriacao() {
        modoEdicao = false;
        idEditando = null;
        form.reset();
        if (modalTitulo) modalTitulo.textContent = "Entrada de Material";
        if (btnSalvar) btnSalvar.textContent = "Salvar";
        modal.style.display = "flex";
    }

    function fecharModal() {
        modal.style.display = "none";
        form.reset();
        modoEdicao = false;
        idEditando = null;
    }

    if (btnEntrada && modal && btnCancelar) {

        // abrir modal (criação)
        btnEntrada.addEventListener("click", abrirModalCriacao);

        // fechar modal
        btnCancelar.addEventListener("click", fecharModal);

        // fechar clicando fora
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });

    
        // SUBMIT DO FORMULÁRIO (cria OU edita)
    
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const formData = new FormData(form);

                const url = modoEdicao
                    ? `/editar_estoque/${idEditando}/`   // AJUSTAR: nome real da sua url de edição
                    : form.action;                        // url original de criação (definida no <form action="...">)

                try {
                    const resp = await fetch(url, {
                        method: "POST",
                        headers: { "X-CSRFToken": csrftoken },
                        body: formData,
                    });

                    const resultado = await resp.json();

                    if (resp.ok && resultado.sucesso !== false) {
                        fecharModal();
                        estoque_pegue(busca.value, lista_items, total); // recarrega a lista
                    } else {
                        alert(resultado.erro || "Erro ao salvar o produto.");
                    }
                } catch (erro) {
                    console.error(erro);
                    alert("Erro ao salvar o produto.");
                }
            });
        }
    }



    // EDITAR PRODUTO

    tabela.addEventListener("click", async (e) => {
        const botao = e.target.closest(".btn-edit");
        if (!botao) return;

        const linha = botao.closest("tr");
        const id = linha.dataset.id;

        try {
            const resp = await fetch(`/pegar_estoque_item/${id}/`); // AJUSTAR: nome real da sua url de detalhe
            const produto = await resp.json();

            if (!resp.ok || produto.sucesso === false) {
                alert(produto.erro || "Erro ao carregar produto.");
                return;
            }

            // Preenche o formulário com os dados do produto
            // AJUSTAR: troque os seletores [name="..."] pelos names reais dos campos do seu form
            form.querySelector('[name="nome"]').value = produto.nome;
            form.querySelector('[name="categoria"]').value = produto.categoria;
            form.querySelector('[name="quantidade"]').value = produto.quantidade;
            form.querySelector('[name="tamanho_estoque"]').value = produto.tamanho_estoque;
            form.querySelector('[name="lote"]').value = produto.lote;
            form.querySelector('[name="validade"]').value = produto.validade;

            modoEdicao = true;
            idEditando = id;

            if (modalTitulo) modalTitulo.textContent = "Editar Produto";
            if (btnSalvar) btnSalvar.textContent = "Atualizar";

            modal.style.display = "flex";

        } catch (erro) {
            console.error(erro);
            alert("Não foi possível carregar os dados do produto.");
        }
    });



    // EXCLUIR PRODUTO

    tabela.addEventListener("click", async (e) => {
        const botao = e.target.closest(".btn-delete");
        if (!botao) return;

        const linha = botao.closest("tr");
        const id = linha.dataset.id;

        const confirmar = confirm("Tem certeza que deseja excluir este produto?");
        if (!confirmar) return;

        try {
            const resp = await fetch(`/excluir_estoque/${id}/`, { // AJUSTAR: nome real da sua url de exclusão
                method: "POST",
                headers: { "X-CSRFToken": csrftoken },
            });

            const resultado = await resp.json();

            if (resp.ok && resultado.sucesso !== false) {
                estoque_pegue(busca.value, lista_items, total); // recarrega a lista e os resumos
            } else {
                alert(resultado.erro || "Erro ao excluir produto.");
            }
        } catch (erro) {
            console.error(erro);
            alert("Não foi possível excluir o produto.");
        }
    });

});