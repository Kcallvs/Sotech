import json
from datetime import date, timedelta,datetime
from django.http import JsonResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404, render,redirect
from .models import Cliente,Funcionario, Pagamento, Pedido,Produto,Estoque
from .forms import ClienteForm, FuncionarioForm,ProdutoForm,FuncionarioFormCadastro,EstoqueForm
from django.db.models import Sum,Q,Count,F,FloatField,Min
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models.functions import Coalesce, ExtractHour

def inicio(request):
    return render(request,"html/login.html")
    
# ------------------------ AUTENTICAÇÃO -------------------------------

def cadastro(request):
    form = FuncionarioFormCadastro(request.POST or None)

    if form.is_valid():
        form.save()
        return redirect('login')
    
    print(form.errors)   
    context = {
        'form': form
    }
    return render(request, 'html/cadastro.html', context)


def autenticar(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None: 
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'html/login.html', {'erro': 'Usuário ou senha inválidos'})
    else:
        return render(request, 'html/login.html')

#LOGOUT

def sair(request):
    logout(request)
    return redirect('inicio')

#==========================FIM=================================


#============== REDIRECIONAMENTO DE CADASTRO PARA A PAG FUNCIONÁRIOS ==============

@login_required
def funcionarios(request):
    funcionarios = Funcionario.objects.all()

    context = { 
        "funcionarios": funcionarios
    }

    return render(request,"html/funcionarios.html",context)

def funcionario_remover(request, id):
    funcionario = Funcionario.objects.get(pk=id)
    funcionario.delete()
    return redirect("funcionarios")   


def funcionario_editar(request, id):
    funcionario = Funcionario.objects.get(pk=id)
    form = FuncionarioForm(request.POST or None, instance=funcionario)
    if form.is_valid():
        form.save()
        return redirect("funcionarios")
    
    context = {
        "form": form,
        "funcionarios": Funcionario.objects.all(),
        "funcionario_edit": funcionario,
        "edit": True,
    }
    return render(request, "html/funcionarios.html", context)
#=====================================FIM==============================================


#======================REDIRECIONAMENTO DE PEDIDOS PARA O DASHBOARD====================

@login_required
def dashboard(request):
    pedidos = Pedido.objects.exclude(status='concluido').order_by('-data_hora_pedido')
    hoje = timezone.now().date()

    vendas_hoje = Pedido.objects.filter(
        data_hora_pedido__date=hoje
    ).aggregate(total=Sum('valor_total'))['total'] or 0

    pedidos_pendentes = Pedido.objects.filter(status='pendente').count()
    itens_em_falta = Estoque.objects.filter(quantidade__lte=5).count()

    context = {
        "pedidos": pedidos,
        "vendas_hoje": vendas_hoje,
        "pedidos_pendentes": pedidos_pendentes,
        "itens_em_falta": itens_em_falta,
    }
    return render(request, "html/dashboard.html", context)


@login_required
def historico(request):
    pedidos = Pedido.objects.filter(status='concluido').order_by('-data_hora_pedido')
    return render(request, "html/historico.html", {"pedidos": pedidos})

@login_required
def finalizar_pedido(request):
    if request.method != "POST":
        return JsonResponse({"erro": "Método inválido"}, status=405)

    try:
        dados = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"erro": "JSON inválido"}, status=400)

    itens = dados.get("itens", [])
    cliente_id = dados.get("cliente_id")
    cliente_nome_novo = dados.get("cliente_nome_novo")
    observacoes = dados.get("observacoes", "")
    forma_pagamento = dados.get("forma_pagamento", "Dinheiro")
    valor_recebido = float(dados.get("valor_recebido") or 0)
    total = float(dados.get("total") or 0)

    if not itens:
        return JsonResponse({"erro": "Carrinho vazio"}, status=400)

    if cliente_nome_novo:
        cliente = Cliente.objects.create(
            nome=cliente_nome_novo,
            endereco="",
            telefone="",
            cadastro_completo=False
        )
    elif cliente_id:
        cliente = Cliente.objects.filter(id=cliente_id).first()
    else:
        cliente = None

    pagamento = Pagamento.objects.create(
        valor_pago=valor_recebido,
        forma_de_pagamento=forma_pagamento,
        troco=max(valor_recebido - total, 0),
        data_hora_pagamento=timezone.now(),
    )

    pedido = Pedido.objects.create(
        data_hora_pedido=timezone.now(),
        valor_total=total,
        observacoes=observacoes,
        pagamento=pagamento,
        cliente=cliente,
        funcionario=request.user,
        status="pendente"
    )

    for item in itens:
        nome_produto = item.get("nome")
        quantidade = int(item.get("quantidade", 1))

        produto = Produto.objects.filter(nome=nome_produto).first()
        if produto:
            for _ in range(quantidade):
                pedido.produtos.add(produto)

    return JsonResponse({
        "sucesso": True,
        "redirect_url": "/dashboard/"
    })

@login_required
def atualizar_status_pedido(request, id):
    if request.method != "POST":
        return JsonResponse({"erro": "Método inválido"}, status=405)

    try:
        dados = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"erro": "JSON inválido"}, status=400)

    novo_status = dados.get("status")

    status_validos = ['pendente', 'preparando', 'concluido']
    if novo_status not in status_validos:
        return JsonResponse({"erro": "Status inválido"}, status=400)

    pedido = Pedido.objects.filter(id=id).first()
    if not pedido:
        return JsonResponse({"erro": "Pedido não encontrado"}, status=404)

    pedido.status = novo_status
    pedido.save()

    return JsonResponse({"sucesso": True, "status": pedido.status})
#=====================================FIM==============================================

#================================CRUD PEDIDOS==========================================

@login_required
def novo_pedido(request):
    lanches = Produto.objects.filter(categoria="lanche")
    bebidas = Produto.objects.filter(categoria="bebida")
    form = ProdutoForm(request.POST or None)

    if form.is_valid():
        produto = form.save(commit=False)
        produto.disponibilidade = "Disponível"  
        produto.save()
        return redirect("pedido")

    context = {
        'lanches': lanches,
        'bebidas': bebidas,
        'form': form,
        'clientes': Cliente.objects.all(),
    }

    return render(request, "html/novo_pedido.html", context)

@login_required
def produto_remover(request,id):
    produto = Produto.objects.get(pk=id)
    produto.delete()
    return redirect("pedido")

#=====================================FIM==============================================


#================================CRUD ESTOQUE==========================================

@login_required
def estoque(request):
    form = EstoqueForm(request.POST or None)
    itens_estoque = Estoque.objects.all()

    if form.is_valid():
        form.save()
        return redirect("estoque")

    context = {
        "form": form,
        "itens_estoque": itens_estoque,
    }
    return render(request, "html/estoque.html", context)


def estoque_remover(request, pk):
    item = Estoque.objects.get(pk=pk)
    item.delete()
    return redirect("estoque")


@login_required
def estoque_editar(request, pk):
    item = Estoque.objects.get(pk=pk)
    form = EstoqueForm(request.POST or None, instance=item)
    itens_estoque = Estoque.objects.all()

    if form.is_valid():
        form.save()
        return redirect("estoque")

    context = {
        "form": form,
        "itens_estoque": itens_estoque,
        "edit": True,
    }
    return render(request, "html/estoque.html", context)

#=====================================FIM==============================================



#==============================CRUD CLIENTE============================================

@login_required
def clientes(request):
    form = ClienteForm(request.POST or None)
    clientes = Cliente.objects.filter(cadastro_completo=True)

    if form.is_valid():
        form.save()
        return redirect("clientes")

    context = {
        "form": form,
        "clients": clientes,
    }
    return render(request, "html/clientes.html", context)

@login_required
def cliente_remover(request,id):
    client = Cliente.objects.get(pk=id)
    client.delete()
    return redirect("clientes")

@login_required
def cliente_editar(request,id):
    cliente = Cliente.objects.get(pk=id)
    form = ClienteForm(request.POST or None,instance=cliente)
    clientes = Cliente.objects.all()
    
    if form.is_valid():
        form.save()
        return redirect("clientes") 
    context={
        "form" : form,
        "clients" : clientes,
        "edit" : True
    }
    return render(request,"html/clientes.html",context)

#=====================================FIM==============================================

@login_required
def perfil(request):
    return render(request,"html/perfil.html")

@login_required
def historico(request):
    pedidos = Pedido.objects.filter(status='concluido').order_by('-data_hora_pedido')
    return render(request, "html/historico.html", {"pedidos": pedidos})

@login_required
def relatorio(request):
    return render(request,"html/relatorio.html")


@login_required
def pegar_estoque(request):
    query = request.GET.get('q', '').strip()
    hoje = date.today()
    limite = hoje + timedelta(days=7)

    itens_criticos = Estoque.objects.filter(validade__lt=hoje)
    itens_vencendo = Estoque.objects.filter(validade__gte=hoje, validade__lte=limite)
    estoque = Estoque.objects.all()

    itens_vencendo = Estoque.objects.filter(validade__gte=hoje, validade__lte=limite)

    if query:
        palavras = query.split()
        filtro = Q()
        for palavra in palavras:
            filtro &= (Q(categoria__icontains=palavra) | Q(nome__icontains=palavra))
        estoque = estoque.filter(filtro)

    estoque = estoque.values('categoria', 'nome', 'quantidade', 'tamanho_estoque', 'lote', 'validade')
    return JsonResponse({"sucesso": True, "lista": list(estoque),"len":len(estoque),"critico":len(itens_criticos),"validade":len(itens_vencendo)})

@login_required
def relatorios_gerais(request):

    de_str = request.GET.get('de')
    ate_str = request.GET.get('ate')
    hoje = timezone.localdate()

    try:
        data_inicio = datetime.strptime(de_str, "%Y-%m-%d").date() if de_str else hoje - timedelta(days=30)
        data_fim = datetime.strptime(ate_str, "%Y-%m-%d").date() if ate_str else hoje
    except ValueError:
        return JsonResponse({"sucesso": False, "erro": "Datas inválidas, use YYYY-MM-DD"}, status=400)

    if data_inicio > data_fim:
        return JsonResponse({"sucesso": False, "erro": "Data inicial não pode ser maior que a data final"}, status=400)

    pedidos = Pedido.objects.filter(
        data_hora_pedido__date__gte=data_inicio,
        data_hora_pedido__date__lte=data_fim
    )

    # --- Financeiro ---
    receita_bruta = pedidos.aggregate(
        total=Coalesce(Sum('valor_total'), 0.0, output_field=FloatField())
    )['total']

    total_pedidos = pedidos.count()
    ticket_medio = round(receita_bruta / total_pedidos, 2) if total_pedidos else 0.0

    meio_pagamento_qs = (
        pedidos.exclude(pagamento__isnull=True)
        .values('pagamento__forma_de_pagamento')
        .annotate(total=Sum('valor_total'))
        .order_by('-total')
    )
    meio_pagamento = [
        {"meio": item['pagamento__forma_de_pagamento'], "total": item['total']}
        for item in meio_pagamento_qs
    ]

    # --- Vendas e Operação ---
    itens_vendidos = pedidos.aggregate(total=Count('produtos'))['total'] or 0

    horas_qs = (
        pedidos.annotate(hora=ExtractHour('data_hora_pedido'))
        .values('hora')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    if horas_qs:
        hora_pico = horas_qs[0]['hora']
        horario_pico = f"{hora_pico}h às {(hora_pico + 2) % 24}h"
    else:
        horario_pico = "Sem dados"

    produtos_mais_vendidos_qs = (
        Produto.objects.filter(pedido__in=pedidos)
        .annotate(qtd=Count('pedido'))
        .order_by('-qtd')
        .values('nome', 'qtd')[:3]
    )
    produtos_mais_vendidos = list(produtos_mais_vendidos_qs)

    # --- Estoque ---
    itens_em_estoque = Estoque.objects.aggregate(
        total=Coalesce(Sum('quantidade'), 0)
    )['total']

    LIMIAR_RUPTURA = 0.2  # 20% do tamanho do estoque
    alertas_ruptura = Estoque.objects.filter(
        quantidade__lte=F('tamanho_estoque') * LIMIAR_RUPTURA
    ).count()

    # --- Fidelidade de Clientes ---
    clientes_ativos = pedidos.exclude(cliente__isnull=True).values('cliente').distinct().count()

    top_clientes = (
        pedidos.exclude(cliente__isnull=True)
        .values('cliente__id', 'cliente__nome')
        .annotate(total_pedidos=Count('id'), total_gasto=Sum('valor_total'))
        .order_by('-total_gasto')[:3]
    )

    top_clientes_lista = [
        {
            "nome": c['cliente__nome'],
            "total_pedidos": c['total_pedidos'],
            "total_gasto": c['total_gasto']
        }
        for c in top_clientes
    ]

    # --- RESPOSTA JSON ---
    return JsonResponse({
        "sucesso": True,
        "periodo": {"de": str(data_inicio), "ate": str(data_fim)},
        "financeiro": {
            "receita_bruta": receita_bruta,
            "ticket_medio": ticket_medio,
            "total_pedidos": total_pedidos,
            "meio_pagamento": meio_pagamento,
        },
        "vendas_operacao": {
            "itens_vendidos": itens_vendidos,
            "horario_pico": horario_pico,
            "produtos_mais_vendidos": produtos_mais_vendidos,
        },
        "estoque": {
            "itens_em_estoque": itens_em_estoque,
            "alertas_ruptura": alertas_ruptura,
        },
        "fidelidade_clientes": {
            "clientes_ativos": clientes_ativos,
            "top_clientes": top_clientes_lista,
        }
    })