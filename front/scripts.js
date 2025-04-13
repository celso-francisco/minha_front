// Variáveis globais para rastrear o estado de edição e modo offline
let isEditing = false;
let originalNome = '';
let originalSobrenome = '';
let clientes = []; // Array para armazenar clientes localmente quando offline
let isOffline = false; // Flag para indicar modo offline

/*
  --------------------------------------------------------------------------------------
  Função para verificar se o backend está disponível
  --------------------------------------------------------------------------------------
*/
const checkBackend = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5000/clientes', { method: 'GET', timeout: 2000 });
    if (!response.ok) throw new Error('Backend indisponível');
    isOffline = false;
  } catch (error) {
    console.warn('Backend não responde, funcionando em modo offline:', error.message);
    isOffline = true;
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor ou localmente
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  await checkBackend();
  if (!isOffline) {
    let url = 'http://127.0.0.1:5000/clientes';
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error('Erro ao carregar lista de clientes');
      const data = await response.json();
      clientes = data.clientes; // Sincroniza com o backend
      clientes.forEach(item => insertList(item.nome, item.sobrenome, item.telefone, item.cep, item.logradouro,
        item.complemento, item.bairro, item.cidade, item.estado));
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao carregar a lista de clientes.');
    }
  } else {
    // Modo offline: carrega do array local
    clientes.forEach(item => insertList(item.nome, item.sobrenome, item.telefone, item.cep, item.logradouro,
      item.complemento, item.bairro, item.cidade, item.estado));
  }
}

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
getList();

/*
  --------------------------------------------------------------------------------------
  Função para colocar um cliente na lista do servidor ou localmente via POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (nome, sobrenome, telefone, cep, logradouro, complemento, bairro, cidade, estado) => {
  const params = new URLSearchParams({
    nome: nome,
    sobrenome: sobrenome,
    telefone: telefone,
    cep: cep,
    logradouro: logradouro,
    complemento: complemento || '', // Trata campo opcional
    bairro: bairro,
    cidade: cidade,
    estado: estado
  });

  if (!isOffline) {
    let url = `http://127.0.0.1:5000/cliente?${params.toString()}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar cliente');
      }
      const result = await response.json();
      console.log('Cliente adicionado:', result);
      alert('Cliente adicionado com sucesso!');
      insertList(nome, sobrenome, telefone, cep, logradouro, complemento, bairro, cidade, estado);
    } catch (error) {
      console.error('Error:', error.message);
      alert(error.message);
    }
  } else {
    // Modo offline: adiciona ao array local
    const cliente = { nome, sobrenome, telefone: parseInt(telefone), cep: parseInt(cep), logradouro, complemento, bairro, cidade, estado };
    if (clientes.some(c => c.nome === nome && c.sobrenome === sobrenome)) {
      alert('Cliente com mesmo nome e sobrenome já existe localmente!');
    } else {
      clientes.push(cliente);
      insertList(nome, sobrenome, telefone, cep, logradouro, complemento, bairro, cidade, estado);
      alert('Cliente adicionado com sucesso (offline)!');
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close e edit para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  parent.appendChild(span);

  let editSpan = document.createElement("span");
  let editTxt = document.createTextNode("\u270E");
  editSpan.className = "edit";
  editSpan.appendChild(editTxt);
  parent.appendChild(editSpan);
}

/*
  --------------------------------------------------------------------------------------
  Função para remover um cliente da lista de acordo com o click no botão close
  --------------------------------------------------------------------------------------
*/
const removeElement = () => {
  let close = document.getElementsByClassName("close");
  for (let i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const nomeItem = div.getElementsByTagName('td')[0].innerHTML;
      const sobrenomeItem = div.getElementsByTagName('td')[1].innerHTML;
      if (confirm("Você tem certeza que deseja remover este cliente?")) {
        div.remove();
        deleteItem(nomeItem, sobrenomeItem);
      }
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor ou localmente via DELETE
  --------------------------------------------------------------------------------------
*/
const deleteItem = async (nome, sobrenome) => {
  if (!isOffline) {
    let url = `http://127.0.0.1:5000/cliente?nome=${encodeURIComponent(nome)}&sobrenome=${encodeURIComponent(sobrenome)}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar cliente');
      }
      const data = await response.json();
      console.log('Cliente removido:', data);
      alert('Cliente removido com sucesso!');
    } catch (error) {
      console.error('Error:', error.message);
      alert(error.message);
    }
  } else {
    // Modo offline: remove do array local
    clientes = clientes.filter(c => !(c.nome === nome && c.sobrenome === sobrenome));
    alert('Cliente removido com sucesso (offline)!');
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar ou atualizar um item com nome, telefone e bairro, etc.
  --------------------------------------------------------------------------------------
*/
const newItem = () => {
  let inputNome = document.getElementById("nome").value.trim();
  let inputSobrenome = document.getElementById("sobrenome").value.trim();
  let inputTelefone = document.getElementById("telefone").value.trim();
  let inputCep = document.getElementById("cep").value.trim();
  let inputLogradouro = document.getElementById("logradouro").value.trim();
  let inputComplemento = document.getElementById("complemento").value.trim();
  let inputBairro = document.getElementById("bairro").value.trim();
  let inputCidade = document.getElementById("cidade").value.trim();
  let inputEstado = document.getElementById("estado").value.trim();

  if (inputNome === '') {
    alert("Escreva o nome do cliente!");
  } else if (inputSobrenome === '') {
    alert("Escreva o sobrenome do cliente!");
  } else if (isNaN(inputTelefone) || inputTelefone.length < 10) {
    alert("Telefone inválido! Use apenas números (mínimo 10 dígitos).");
  } else if (isNaN(inputCep) || inputCep.length !== 8) {
    alert("CEP inválido! Deve conter 8 dígitos.");
  } else if (inputEstado.length !== 2) {
    alert("Estado inválido! Use a sigla com 2 letras (ex: SP).");
  } else {
    if (isEditing) {
      updateItem(originalNome, originalSobrenome, inputTelefone, inputCep, inputLogradouro,
        inputComplemento, inputBairro, inputCidade, inputEstado);
      isEditing = false;
      originalNome = '';
      originalSobrenome = '';
    } else {
      postItem(inputNome, inputSobrenome, inputTelefone, inputCep, inputLogradouro,
        inputComplemento, inputBairro, inputCidade, inputEstado);
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir clientes na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = (nome, sobrenome, telefone, cep, logradouro, complemento, bairro, cidade, estado) => {
  var item = [nome, sobrenome, telefone, cep, logradouro, complemento, bairro, cidade, estado];
  var table = document.getElementById('myTable');
  var row = table.insertRow();
  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }
  insertButton(row.insertCell(-1));
  document.getElementById("nome").value = "";
  document.getElementById("sobrenome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("cep").value = "";
  document.getElementById("logradouro").value = "";
  document.getElementById("complemento").value = "";
  document.getElementById("bairro").value = "";
  document.getElementById("cidade").value = "";
  document.getElementById("estado").value = "";
  removeElement();
  editElement();
}

/*
  --------------------------------------------------------------------------------------
  Função para obter o endereço do cliente pelo CEP
  --------------------------------------------------------------------------------------
*/
const btnBuscar = document.getElementById('btn-buscar');
const cepInput = document.getElementById('cep');
const logradouroInput = document.getElementById('logradouro');
const bairroInput = document.getElementById('bairro');
const cidadeInput = document.getElementById('cidade');
const estadoInput = document.getElementById('estado');

btnBuscar.addEventListener('click', async (e) => {
  e.preventDefault();
  const cep = cepInput.value;
  if (cep.length !== 8 || isNaN(cep)) {
    alert('Digite um CEP válido com 8 dígitos!');
    return;
  }
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error('Erro ao consultar CEP');
    const data = await response.json();
    if (data.erro) throw new Error('CEP não encontrado');
    logradouroInput.value = data.logradouro;
    bairroInput.value = data.bairro;
    cidadeInput.value = data.localidade;
    estadoInput.value = data.uf;
  } catch (error) {
    console.error('Error:', error.message);
    alert(error.message);
  }
});

/*
  --------------------------------------------------------------------------------------
  Função para editar um item da lista
  --------------------------------------------------------------------------------------
*/
const editElement = () => {
  let edit = document.getElementsByClassName("edit");
  for (let i = 0; i < edit.length; i++) {
    edit[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const cells = div.getElementsByTagName('td');
      document.getElementById("nome").value = cells[0].innerHTML;
      document.getElementById("sobrenome").value = cells[1].innerHTML;
      document.getElementById("telefone").value = cells[2].innerHTML;
      document.getElementById("cep").value = cells[3].innerHTML;
      document.getElementById("logradouro").value = cells[4].innerHTML;
      document.getElementById("complemento").value = cells[5].innerHTML;
      document.getElementById("bairro").value = cells[6].innerHTML;
      document.getElementById("cidade").value = cells[7].innerHTML;
      document.getElementById("estado").value = cells[8].innerHTML;
      originalNome = cells[0].innerHTML;
      originalSobrenome = cells[1].innerHTML;
      isEditing = true;
      div.remove();
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para atualizar um item da lista no servidor ou localmente
  --------------------------------------------------------------------------------------
*/
const updateItem = async (originalNome, originalSobrenome, telefone, cep, logradouro, complemento, bairro, cidade, estado) => {
  const params = new URLSearchParams({
    nome: originalNome,
    sobrenome: originalSobrenome,
    telefone: telefone,
    cep: cep,
    logradouro: logradouro,
    complemento: complemento || '',
    bairro: bairro,
    cidade: cidade,
    estado: estado
  });

  if (!isOffline) {
    let url = `http://127.0.0.1:5000/cliente?${params.toString()}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar cliente');
      }
      const result = await response.json();
      console.log('Cliente atualizado:', result);
      alert('Cliente atualizado com sucesso!');
      insertList(originalNome, originalSobrenome, telefone, cep, logradouro, complemento, bairro, cidade, estado);
    } catch (error) {
      console.error('Error:', error.message);
      alert(error.message);
      const table = document.getElementById('myTable');
      while (table.rows.length > 1) {
        table.deleteRow(1);
      }
      getList();
    }
  } else {
    // Modo offline: atualiza no array local
    const cliente = { nome: originalNome, sobrenome: originalSobrenome, telefone: parseInt(telefone), cep: parseInt(cep), logradouro, complemento, bairro, cidade, estado };
    const index = clientes.findIndex(c => c.nome === originalNome && c.sobrenome === originalSobrenome);
    if (index !== -1) {
      clientes[index] = cliente;
      insertList(originalNome, originalSobrenome, telefone, cep, logradouro, complemento, bairro, cidade, estado);
      alert('Cliente atualizado com sucesso (offline)!');
    } else {
      alert('Cliente não encontrado localmente!');
    }
  }
}