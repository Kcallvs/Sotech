from django.shortcuts import render,redirect
from .forms import ClienteForm,ProdutoForm
from .models import Cliente,Funcionario,Produto

def inicio(request):
    return render(request,"html/login.html")

def login(request):
    return render(request,"html/login.html")

def cadastro(request):
    return render(request,"html/cadastro.html")

def dashboard(request):
    return render(request,"html/dashboard.html")

def perfil(request):
    return render(request,"html/perfil.html")

def novo_pedido(request):
    lanches=Produto.objects.filter(categoria="lanche")
    bebidas=Produto.objects.filter(categoria="bebida")
    form = ProdutoForm(request.POST or None)


    if form.is_valid():
        form.save()
        return redirect("pedido")
    context={
        'lanches' : lanches,
        'bebidas' : bebidas,
        'form' : form
    }

    return render(request,"html/novo_pedido.html",context)

def historico(request):
    return render(request,"html/historico.html")

def estoque(request):
    return render(request,"html/estoque.html")

# def clientes(request):
#     return render(request,"html/clientes.html")

def funcionarios(request):
    return render(request,"html/funcionarios.html")

def relatorio(request):
    return render(request,"html/relatorio.html")

# def cliente_editar(request,id):
#     cliente= 

def clientes(request):
    form = ClienteForm(request.POST or None)
    clientes = Cliente.objects.all()

    if form.is_valid():
        form.save()
        return redirect("clientes")
    context={
        "form" : form,
        "clients" : clientes,
    }
    return render(request,"html/clientes.html",context)

def cliente_remover(request,id):
    client = Cliente.objects.get(pk=id)
    client.delete()
    return redirect("clientes")

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
