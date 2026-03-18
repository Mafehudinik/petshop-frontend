# 🚀 Guia de Teste Rápido - Sistema Pet Shop

## ⚡ Início Rápido (5 minutos)

### 1. Preparar Backend

```bash
# Entrar na pasta do backend
cd backend

# Instalar dependências (se ainda não instalou)
npm install

# Inicializar banco de dados
node init-db.js

# Iniciar servidor
npm start
```

✅ **Verificar**: Deve aparecer "🚀 Servidor rodando na porta 8000"

### 2. Preparar Frontend

```bash
# Em outro terminal, entrar na pasta do frontend
cd frontend

# Instalar dependências (se ainda não instalou)
npm install

# Iniciar aplicação
ionic serve
```

✅ **Verificar**: Navegador abrirá em `http://localhost:8100`

### 3. Fazer Login

**Credenciais padrão:**
- Email: `admin@rabichos.com`
- Senha: `admin123`

## 🧪 Roteiro de Testes

### Teste 1: Dashboard (30 segundos)
1. Após login, você verá o dashboard
2. Verifique os cards de estatísticas
3. Veja agendamentos do dia
4. Confira pets no hotel

### Teste 2: Clientes (1 minuto)
1. Clique em "Clientes" no menu lateral
2. Clique em "Novo cliente"
3. Preencha os dados:
   - Nome: João Silva
   - Telefone: (16) 99999-9999
   - Email: joao@email.com
4. Clique em "Cadastrar"
5. Veja o cliente na lista

### Teste 3: Pets (1 minuto)
1. Clique em "Pets" no menu
2. Clique em "Novo pet"
3. Preencha:
   - Nome: Rex
   - Cliente: João Silva
   - Espécie: Cachorro
   - Raça: Labrador
4. Cadastre e veja na lista

### Teste 4: Serviços (30 segundos)
1. Clique em "Serviços"
2. Clique em "Novo serviço"
3. Preencha:
   - Nome: Banho e Tosa
   - Preço: 80.00
   - Duração: 60 minutos
4. Cadastre

### Teste 5: Agenda (1 minuto)
1. Clique em "Agenda"
2. Clique em "Novo agendamento"
3. Selecione:
   - Cliente: João Silva
   - Pet: Rex
   - Serviço: Banho e Tosa
   - Data: Hoje
   - Horário: 14:00
4. Confirme

### Teste 6: Vendas/PDV (1 minuto)
1. Clique em "Vendas (PDV)"
2. Adicione produtos ao carrinho
3. Aplique desconto (opcional)
4. Escolha forma de pagamento
5. Finalize a venda

### Teste 7: Estoque (30 segundos)
1. Clique em "Estoque"
2. Veja produtos cadastrados
3. Clique em "Novo produto"
4. Cadastre um produto de teste

### Teste 8: Funcionários (30 segundos)
1. Clique em "Funcionários"
2. Clique em "Novo funcionário"
3. Cadastre um funcionário
4. Defina comissão

### Teste 9: Hotel (1 minuto)
1. Clique em "Hotel"
2. Faça check-in de um pet
3. Preencha instruções
4. Veja na lista de hospedados

### Teste 10: Relatórios (30 segundos)
1. Clique em "Relatórios"
2. Navegue pelas abas:
   - Vendas
   - Serviços
   - Clientes
   - Hotel
3. Veja os dados

### Teste 11: WhatsApp (30 segundos)
1. Clique em "WhatsApp"
2. Configure (pode usar dados fictícios)
3. Veja histórico de mensagens
4. Teste envio manual

## ✅ Checklist de Funcionalidades

- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Clientes: criar, editar, listar
- [ ] Pets: criar, editar, listar, filtrar
- [ ] Agenda: criar agendamento
- [ ] Hotel: check-in, check-out
- [ ] Vendas: adicionar produtos, finalizar
- [ ] Estoque: cadastrar produto
- [ ] Serviços: criar serviço
- [ ] Funcionários: cadastrar
- [ ] Relatórios: visualizar dados
- [ ] WhatsApp: configurar

## 🐛 Problemas Comuns

### Backend não inicia
```bash
# Verificar se a porta 8000 está livre
netstat -ano | findstr :8000

# Ou mudar a porta no .env
PORT=8001
```

### Frontend não carrega
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Banco de dados não cria
```bash
# Deletar banco antigo e recriar
rm petshop.db
node init-db.js
```

### Erro de CORS
- Verifique se o backend está rodando
- Confirme a URL no `environment.ts` do frontend

## 📊 Dados de Teste

O sistema já vem com dados de exemplo após executar `init-db.js`:

- 1 empresa (Rabichos)
- 1 usuário admin
- 5 clientes
- 8 pets
- 6 serviços
- 3 funcionários
- 10 produtos
- Alguns agendamentos

## 🎯 Teste Completo (10 minutos)

1. **Login** → Dashboard
2. **Criar cliente** → Adicionar pet
3. **Criar serviço** → Agendar para o pet
4. **Fazer venda** → Verificar estoque
5. **Check-in hotel** → Ver no dashboard
6. **Gerar relatório** → Verificar dados
7. **Configurar WhatsApp** → Testar envio

## 💡 Dicas

- Use o menu lateral para navegar
- Todos os modais têm botão de fechar (X)
- Busca funciona em tempo real
- Filtros são aplicados automaticamente
- Dados são salvos no SQLite local

## 🎨 Identidade Visual

Observe durante os testes:
- Verde militar (#1b5e35) predominante
- Logo Rabichos com cachorro e gato
- Cards com sombras suaves
- Botões arredondados
- Sidebar com gradiente
- Ícones consistentes

## 📱 Teste Mobile

```bash
# Adicionar plataforma
ionic capacitor add android
# ou
ionic capacitor add ios

# Build
ionic build

# Sincronizar
ionic capacitor sync

# Abrir no Android Studio / Xcode
ionic capacitor open android
ionic capacitor open ios
```

## ✨ Recursos Especiais

- **Busca em tempo real** em todas as listas
- **Filtros dinâmicos** por categoria
- **Paginação** automática
- **Alertas** de estoque baixo
- **Status coloridos** nos agendamentos
- **Cálculo automático** de totais
- **Validação** de formulários

## 🔄 Reset do Sistema

Para começar do zero:

```bash
cd backend
rm petshop.db
node init-db.js
```

Isso recria o banco com dados iniciais.

---

**Tempo total estimado: 10-15 minutos**

Boa sorte nos testes! 🐾
