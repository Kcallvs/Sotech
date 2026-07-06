import json
from django.http import JsonResponse
from django.utils import timezone
from django.shortcuts import render,redirect
from .models import Cliente,Funcionario, Pagamento, Pedido,Produto,Estoque
from .forms import ClienteForm,ProdutoForm,FuncionarioFormCadastro,EstoqueForm
from django.db.models import Sum,Q
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

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


@login_required
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


#============== REDIRECIONAMENTO DE CADASTRO PARA O A PAG FUNCIONÁRIOS ==============

@login_required
def funcionarios(request):
    funcionarios = Funcionario.objects.all()

    context = { 
        "funcionarios": funcionarios
    }

    return render(request,"html/funcionarios.html",context)

@login_required
def funcionario_remover(request, id):
    funcionario = Funcionario.objects.get(pk=id)
    funcionario.delete()
    return redirect("funcionarios") 

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

def produto_remover(request,id):
    produto = Produto.objects.get(pk=id)
    produto.delete()
    return redirect("pedido")

#=====================================FIM==============================================


#================================CRUD ESTOQUE==========================================

@login_required
def estoque(request):
    form = EstoqueForm(request.POST or None)
    estoques = Estoque.objects.all()
    
    if form.is_valid():
        form.save()
        return redirect("estoque")
    context={
        'form':form,
        'estoques' : estoques
    }
    return render(request,"html/estoque.html",context)

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

    estoque = Estoque.objects.all()

    if query:
        palavras = query.split()
        filtro = Q()
        for palavra in palavras:
            filtro &= (Q(categoria__icontains=palavra) | Q(nome__icontains=palavra))
        estoque = estoque.filter(filtro)

    estoque = estoque.values('categoria', 'nome', 'quantidade', 'tamanho_estoque', 'lote', 'validade')

    return JsonResponse({"sucesso": True, "lista": list(estoque)})