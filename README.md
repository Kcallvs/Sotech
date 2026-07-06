# SOTECH

[soluções tecnológicas]

O **Sotech** é um sistema de gerenciamento desenvolvido especificamente para estabelecimentos de **pequeno porte** do ramo alimentício, como lanchonetes. A proposta é oferecer uma ferramenta simples e prática para o controle do dia a dia do negócio, ajudando no gerenciamento de pedidos, produtos, estoque e demais rotinas administrativas, sem a complexidade e o custo de sistemas voltados para grandes redes ou franquias.

## Funcionalidades

- Cadastro e gerenciamento de funcionários
- Cadastro e gerenciamento de clientes fixos
- Cadastro e gerenciamento de produtos
- Realização de pedidos com cálculo automático de troco e forma de pagamento
- Controle de estoque (entrada de materiais, edição e verificação de validade dos produtos)
- Geração de relatórios

## Tecnologias utilizadas

- **Python** — linguagem principal do sistema
- **Django** — framework web utilizado no desenvolvimento
- **SQLite** — banco de dados (padrão do Django)

## Requisitos

- Python 3.x instalado

## Instalação

Para usar o sistema, é recomendado o uso de um **venv** junto ao arquivo `dependencias.txt` para instalar as dependências:

```
python -m venv venv
venv\Scripts\activate
pip install -r dependencias.txt
```

## Banco de dados

Para modificações em relação às tabelas do banco de dados:

```
python manage.py makemigrations
python manage.py migrate
```

