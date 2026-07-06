
async function estoque_pegue(string_de_busca="",lista){
    try {
        const params = new URLSearchParams();

        if(string_de_busca!==""){
            params.append("q",string_de_busca);
        }

        const resposta = await fetch(`/pegar_estoque/?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
           
        });

        const resultado = await resposta.json();
      
        if (resultado.sucesso) {
           renderizar_lista(resultado.lista,lista)
        } else {
            alert(resultado.erro || "Erro ao pegar dados");
        }
    } catch (erro) {
        console.error(erro);
        alert("erro ao carregar o estoque");
    }
}

function renderizar_lista(_info,lista){
    let string="";

    _info.forEach(estoque => {
        string+=`<tr>
              <td>
                <strong>${estoque.nome}</strong>
              </td>
              <td>${estoque.categoria}</td>
              <td>${estoque.quantidade} un</td>
              <td>${estoque.tamanho_estoque} un</td>
              <td>${estoque.lote}</td>
              <td>${estoque.validade}</td>
              <td>
                <span class="badge red">Crítico</span>
              </td>

              <td>
                <button class="action-icon"><i class="fas fa-sync"></i></button>
                <button class="action-icon"><i class="fas fa-edit"></i></button>
              </td>
            </tr>`
    });
    lista.innerHTML=string;

}



document.addEventListener("DOMContentLoaded", () => {

    const tabela = document.querySelector(".inventory-table tbody");
    const busca = document.querySelector(".search-input");
    
    const itensCriticos = document.querySelector(".summary-card:nth-child(1) strong");
    const itensVencendo = document.querySelector(".summary-card:nth-child(2) strong");
    const totalItens = document.querySelector(".summary-card:nth-child(3) strong");

    const lista_items= document.getElementById('estoque_lista');



    lista_items.innerHTML="";

    estoque_pegue("",lista_items);

    
    
    // FILTRO DE BUSCA
    
    busca.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            estoque_pegue(busca.value,lista_items);
        }
    });
    
    
    // FUNÇÃO VERIFICAR VALIDADE
    
    function verificarValidade(dataValidade){
    
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
    
        let validade;

        if (dataValidade.includes("/")) {
            const partes = dataValidade.split("/");
            validade = new Date(partes[2], partes[1] - 1, partes[0]);
        } else if (dataValidade.includes("-")) {
            const partes = dataValidade.split("-");
            validade = new Date(partes[0], partes[1] - 1, partes[2]);
        } else {
            return "normal";
        }
    
        const diferenca = validade - hoje;
    
        const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
        if(dias < 0){
            return "critico";
        }
    
        if(dias <= 7){
            return "vencendo";
        }
    
        return "normal";
    
    }
    
    
    // ATUALIZAR STATUS
    
    function atualizarStatus(){
    
        const linhas = document.querySelectorAll(".inventory-table tbody tr");
    
        linhas.forEach(linha => {
    
            const data = linha.children[4].textContent;
    
            const status = verificarValidade(data);
    
            const badge = linha.querySelector(".badge");
    
            if(status === "critico"){
                badge.textContent = "Crítico";
                badge.className = "badge red";
            }
    
            if(status === "vencendo"){
                badge.textContent = "Vencendo";
                badge.className = "badge yellow";
            }
    
            if(status === "normal"){
                badge.textContent = "Normal";
                badge.className = "badge green";
            }
    
        });
    
    }
    
    
    // ATUALIZAR RESUMO
    
    function atualizarResumo(){
    
        const linhas = document.querySelectorAll(".inventory-table tbody tr");
    
        let criticos = 0;
        let vencendo = 0;
    
        linhas.forEach(linha => {
    
            const status = linha.querySelector(".badge").textContent;
    
            if(status.includes("Crítico")) criticos++;
    
            if(status.includes("Vencendo")) vencendo++;
    
        });
    
        itensCriticos.textContent = criticos;
        itensVencendo.textContent = vencendo;
        totalItens.textContent = linhas.length;
    
    }
    
    
    // EXECUTAR AO CARREGAR
    
    atualizarStatus();
    atualizarResumo();
    
    
    // ATUALIZAR QUANTIDADE
    
    tabela.addEventListener("click", (e)=>{
    
        const botao = e.target.closest(".fa-sync");
    
        if(!botao) return;
    
        const linha = botao.closest("tr");
    
        let qtd = linha.children[2].textContent;
        qtd = parseInt(qtd);
    
        const novaQtd = prompt("Nova quantidade:", qtd);
    
        if(novaQtd !== null){
    
            linha.children[2].textContent = novaQtd + " un";
    
        }
    
    });
    
    
    // // EDITAR PRODUTO
    
    // tabela.addEventListener("click", (e)=>{
    
    //     const botao = e.target.closest(".fa-edit");
    
    //     if(!botao) return;
    
    //     const linha = botao.closest("tr");
    
    //     const nome = linha.children[0].textContent;
    //     const categoria = linha.children[1].textContent;
    
    //     const novoNome = prompt("Editar nome:", nome);
    //     const novaCategoria = prompt("Editar categoria:", categoria);
    
    //     if(novoNome) linha.children[0].innerHTML = "<strong>"+novoNome+"</strong>";
    //     if(novaCategoria) linha.children[1].textContent = novaCategoria;
    
    // });
    
    
    
    // MODAL - ENTRADA DE MATERIAL
    
    const btnEntrada = document.getElementById("btnEntrada");
    const modal = document.getElementById("modalCliente");
    const btnCancelar = document.getElementById("btnCancelar");
    const form = document.getElementById("formEntrada");
    
    if (!btnEntrada) console.error('Elemento #btnEntrada não encontrado no HTML.');
    if (!modal) console.error('Elemento #modalCliente não encontrado no HTML.');
    if (!btnCancelar) console.error('Elemento #btnCancelar não encontrado no HTML.');
    
    if (btnEntrada && modal && btnCancelar) {
    
        // abrir modal
        btnEntrada.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    
        // fechar modal
        btnCancelar.addEventListener("click", () => {
            modal.style.display = "none";
        });
    
        // fechar clicando fora
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    
        if (form) {
            form.addEventListener("submit", () => {
                modal.style.display = "none";
            });
        }
    
    }
    
    });