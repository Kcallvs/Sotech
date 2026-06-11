document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("loginModal");
    const btnLogar = document.getElementById("btnLogar");
    const spanClose = document.querySelector(".close-modal");
    const formLogin = document.getElementById("formLogin");

    // 1. Abre o Modal
    btnLogar.onclick = () => modal.style.display = "block";

    // 2. Fecha o Modal
    spanClose.onclick = () => modal.style.display = "none";

    // 3. Validação e Redirecionamento
    formLogin.onsubmit = (e) => {
        e.preventDefault();
        
        const nomeInput = document.getElementById("loginNome").value;
        const cpfInput = document.getElementById("loginCPF").value;

        // Simulando dados que viriam da sua tabela 'funcionario' (id, nome, cargo, turno, cpf)
        // No futuro, aqui você fará um SELECT no banco de dados
        const fakesDB = [
            { nome: "João Silva", cpf: "123", cargo: "Atendente", turno: "Noite" },
            { nome: "Maria Souza", cpf: "456", cargo: "Gerente", turno: "Manhã" }
        ];

        const usuarioEncontrado = fakesDB.find(u => u.nome === nomeInput && u.cpf === cpfInput);

        if (usuarioEncontrado) {
            // Salva os dados na sessão do navegador
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));
            
            alert(`Login realizado! Cargo: ${usuarioEncontrado.cargo}`);
            
            // Direciona para a página "perfil_funcionario.html" (que você pode criar)
            // Ou apenas recarrega a página atual com o nome dele no topo
            location.reload(); 
        } else {
            alert("Funcionário não encontrado ou CPF incorreto!");
        }
    };

    // 4. Checar se já existe alguém logado ao carregar a página
    const logado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (logado) {
        document.getElementById("boasVindas").innerHTML = `Olá, <strong>${logado.nome}</strong> (${logado.cargo})`;
        btnLogar.textContent = "Sair";
        btnLogar.onclick = () => {
            localStorage.removeItem("usuarioLogado");
            location.reload();
        };
    }
});