from django.shortcuts import render,redirect
from .models import Cliente,Funcionario,Produto
from .forms import ClienteForm,ProdutoForm,FuncionarioFormCadastro
from django.contrib.auth import authenticate, login, logout


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

def funcionarios(request):
    funcionarios = Funcionario.objects.all()

    return render(request,"html/funcionarios.html",{ "funcionarios": funcionarios}
    )


def autenticar(request):
    if request.POST:
        username= request.POST['username']
        password= request.POST['password']
        user = authenticate(request,username= username, password= password)
        if user is not None:
            login(request,user)
            return redirect('dashboard')
        else:
            return render(request, 'html/login.html')
    else:
            return render(request, 'html/login.html')

def sair(request):
    logout(request)
    return redirect('inicio')


def inicio(request):
    return render(request,"html/login.html")

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
