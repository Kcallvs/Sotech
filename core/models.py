from django.db import models
from django.contrib.auth.models import AbstractUser


# # necessario para evitar problema de normalização
# class Produto_categoria(models.Model):
#     nome = models.CharField("Nome",max_length=45)
#     def __str__(self):
#         return self.nome

class Funcionario(AbstractUser):
    cargo = models.CharField("Cargo", max_length=50)
    turno = models.CharField("Turno", max_length=50)
    cpf = models.CharField("CPF", max_length=11)

    def __str__(self):
        return self.username


class Cliente(models.Model):
    nome = models.CharField("Nome", max_length=50)
    endereco = models.CharField("Endereço", max_length=100)
    telefone = models.CharField("Telefone", max_length=15)

    def __str__(self):
        return self.nome


class Pagamento(models.Model):
    valor_pago = models.FloatField("Valor pago")
    forma_de_pagamento = models.CharField("Forma de pagamento",max_length=15)
    troco = models.FloatField("Troco")
    data_hora_pagamento = models.DateTimeField("Data e hora do pagamento")

    def __str__(self):
        return self.forma_de_pagamento


class Estoque(models.Model):
    data_hora_entrada = models.DateTimeField("Data e hora da entrada")
    data_hora_saida = models.DateTimeField("Data e hora da saída")
    tamanho_estoque = models.IntegerField("Tamanho do estoque")
    quantidade = models.IntegerField("Quantidade")
    validade = models.DateField("Validade")
    localizacao = models.CharField("Localização",max_length=45)
    lote = models.CharField("Lote",max_length=45
    )

    def __str__(self):
        return self.lote


class Produto(models.Model):
    categoria = models.CharField("Categoria",max_length=45)
    nome = models.CharField("Nome",max_length=45)
    preco = models.FloatField("Preço")
    disponibilidade = models.CharField("Disponibilidade",max_length=45)
    estoque = models.ForeignKey(Estoque,on_delete=models.PROTECT)
    #estoque = models.ForeignKey(Produto_categoria,on_delete=models.PROTECT)
     
    def __str__(self):
        return self.nome


class Pedido(models.Model):
    data_hora_pedido = models.DateTimeField("Data e hora do pedido")
    valor_total = models.FloatField("Valor total")
    observacoes = models.CharField("Observações", max_length=200)
    produtos = models.ManyToManyField(Produto)
    pagamento = models.ForeignKey(Pagamento,on_delete=models.PROTECT)
    cliente = models.ForeignKey(Cliente,on_delete=models.PROTECT)
    funcionario = models.ForeignKey(Funcionario,on_delete=models.PROTECT)

    def __str__(self):
        return f'Pedido {self.id}'
    
# tabela relatorio faltando