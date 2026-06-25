function digitar_cpf() {
    const campo = document.getElementById("id_cpf");

    let cpf = campo.value;

    cpf = cpf.replace(/\D/g, "");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    campo.value = cpf;
}

function digitar_telefone() {
    const campo = document.getElementById("id_telefone");
    let tel = campo.value;
    tel = tel.replace(/\D/g, "");
    tel = tel.replace(/(\d{2})(\d)/, "($1) $2");
    tel = tel.replace(/(\d{1})(\d{4})(\d{4})$/, "$1 $2-$3");
    campo.value = tel;
}