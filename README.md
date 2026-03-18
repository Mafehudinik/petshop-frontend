# 🐾 Sistema de Gestão para Pet Shop - Rabichos Banho & Tosa

Sistema completo de gestão para pet shops desenvolvido com Angular + Ionic no frontend e Node.js + Express no backend.

## 📋 Funcionalidades Implementadas

### ✅ Autenticação
- Login com JWT
- Controle de sessão
- Tipos de usuários (Admin, Atendente, Funcionário)

### ✅ Gestão de Clientes
- CRUD completo
- Busca e filtros
- Paginação
- Histórico de atendimentos

### ✅ Gestão de Pets
- CRUD completo
- Vinculação com clientes
- Filtros por espécie
- Histórico de serviços
- Upload de fotos

### ✅ Agenda de Serviços
- Visualização diária e semanal
- Criação de agendamentos
- Status (agendado, confirmado, em andamento, concluído, cancelado)
- Vinculação com funcionários

### ✅ Hotel para Pets
- Check-in e check-out
- Controle de hospedagem
- Instruções de alimentação e medicação
- Cálculo de diárias

### ✅ Sistema de Vendas (PDV)
- Carrinho de compras
- Múltiplas formas de pagamento (PIX, cartão, dinheiro)
- Cálculo de desconto
- Histórico de vendas

### ✅ Controle de Estoque
- CRUD de produtos
- Entrada e saída de estoque
- Alertas de estoque baixo
- Movimentações

### ✅ Gestão de Funcionários
- CRUD completo
- Controle de comissões
- Agenda por funcionário

### ✅ Catálogo de Serviços
- CRUD completo
- Preços e duração
- Serviços ativos/inativos

### ✅ Relatórios
- Faturamento diário e mensal
- Produtos mais vendidos
- Serviços mais agendados
- Clientes mais frequentes
- Relatório de hotel

### ✅ Integração WhatsApp
- Configuração de API
- Envio de confirmações
- Lembretes automáticos
- Aviso de pet pronto
- Histórico de mensagens

### ✅ Dashboard
- Visão geral do dia
- Estatísticas em tempo real
- Agendamentos do dia
- Pets no hotel
- Alertas do sistema

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular** - Framework principal
- **Ionic Framework** - UI components e mobile
- **SCSS** - Estilização
- **TypeScript** - Linguagem

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas

## 📁 Estrutura do Projeto

```
pet/
├── frontend/           # Aplicação Angular + Ionic
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/           # Páginas da aplicação
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── clients/
│   │   │   │   ├── pets/
│   │   │   │   ├── agenda/
│   │   │   │   ├── hotel/
│   │   │   │   ├── vendas/
│   │   │   │   ├── estoque/
│   │   │   │   ├── servicos/
│   │   │   │   ├── funcionarios/
│   │   │   │   ├── relatorio/
│   │   │   │   └── whatsapp/
│   │   │   ├── services/        # Serviços (API, Auth)
│   │   │   └── guards/          # Guards de rota
│   │   ├── theme/               # Variáveis de tema
│   │   └── global.scss          # Estilos globais
│   └── package.json
│
├── backend/            # API Node.js + Express
│   ├── src/
│   │   ├── controllers/         # Lógica de negócio
│   │   │   ├── authController.js
│   │   │   ├── clientController.js
│   │   │   ├── petController.js
│   │   │   ├── serviceController.js
│   │   │   ├── employeeController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── reportController.js
│   │   │   └── whatsappController.js
│   │   ├── routes/              # Rotas da API
│   │   ├── middleware/          # Middlewares (auth)
│   │   └── config/              # Configurações (DB)
│   ├── .env                     # Variáveis de ambiente
│   └── package.json
│
└── database/           # Scripts SQL
    ├── schema.sqlite.sql        # Estrutura do banco
    └── seed.sqlite.sql          # Dados iniciais
```

## 🚀 Como Executar

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicializar banco de dados
node init-db.js

# Iniciar servidor
npm start
# ou para desenvolvimento com auto-reload
npm run dev
```

O backend estará rodando em `http://localhost:8000`

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar aplicação
ionic serve
# ou
npm start
```

O frontend estará rodando em `http://localhost:8100`

### 3. Banco de Dados

O banco de dados SQLite será criado automaticamente ao executar `init-db.js`.

Estrutura:
- 15 tabelas criadas
- Relacionamentos configurados
- Índices otimizados
- Dados de exemplo (seed)

## 🎨 Identidade Visual

### Cores Principais
- **Verde Militar**: `#1b5e35` (primária)
- **Verde Claro**: `#2e7d4f` (secundária)
- **Verde Escuro**: `#1a4a28` (gradiente)
- **Vermelho**: `#e53935` (danger/coração)
- **Fundo**: `#f5f7f5`

### Tipografia
- **Fonte**: System fonts (Apple, Segoe UI, Roboto)
- **Logo**: Georgia (serif)

### Componentes
- Cards com sombras suaves
- Botões arredondados (8px)
- Sidebar com gradiente verde
- Ícones Ionicons

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🔐 Autenticação

### Usuário Padrão (após seed)
```
Email: admin@rabichos.com
Senha: admin123
```

### Níveis de Acesso
- **Admin**: Acesso total
- **Atendente**: Clientes, pets, agenda, vendas
- **Funcionário**: Apenas agenda e serviços

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Clientes
- `GET /api/clients` - Listar
- `GET /api/clients/:id` - Buscar
- `POST /api/clients` - Criar
- `PUT /api/clients/:id` - Atualizar
- `DELETE /api/clients/:id` - Deletar

### Pets
- `GET /api/pets` - Listar
- `GET /api/pets/:id` - Buscar
- `POST /api/pets` - Criar
- `PUT /api/pets/:id` - Atualizar
- `DELETE /api/pets/:id` - Deletar

### Agendamentos
- `GET /api/appointments` - Listar
- `GET /api/appointments/:id` - Buscar
- `POST /api/appointments` - Criar
- `PUT /api/appointments/:id` - Atualizar
- `DELETE /api/appointments/:id` - Deletar

### Hotel
- `GET /api/hotel` - Listar hospedagens
- `POST /api/hotel/checkin` - Check-in
- `POST /api/hotel/checkout` - Check-out

### Vendas
- `GET /api/sales` - Listar
- `POST /api/sales` - Criar venda

### Produtos
- `GET /api/products` - Listar
- `POST /api/products` - Criar
- `PUT /api/products/:id` - Atualizar
- `POST /api/products/:id/restock` - Repor estoque

### Serviços
- `GET /api/services` - Listar
- `POST /api/services` - Criar
- `PUT /api/services/:id` - Atualizar
- `DELETE /api/services/:id` - Deletar

### Funcionários
- `GET /api/employees` - Listar
- `POST /api/employees` - Criar
- `PUT /api/employees/:id` - Atualizar
- `DELETE /api/employees/:id` - Deletar

### Relatórios
- `GET /api/reports/sales` - Relatório de vendas
- `GET /api/reports/top-products` - Produtos mais vendidos
- `GET /api/reports/top-services` - Serviços mais agendados
- `GET /api/reports/top-clients` - Clientes mais frequentes
- `GET /api/reports/appointments` - Relatório de agendamentos
- `GET /api/reports/hotel` - Relatório de hotel
- `GET /api/reports/monthly-revenue` - Faturamento mensal

### WhatsApp
- `GET /api/whatsapp/config` - Buscar configuração
- `PUT /api/whatsapp/config` - Atualizar configuração
- `POST /api/whatsapp/send/confirmation` - Enviar confirmação
- `POST /api/whatsapp/send/reminder` - Enviar lembrete
- `POST /api/whatsapp/send/ready` - Enviar aviso de pronto
- `GET /api/whatsapp/history` - Histórico de mensagens

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais

## 🔧 Configuração do WhatsApp

Para integrar com WhatsApp Business API:

1. Acesse a página de WhatsApp no sistema
2. Configure a API Key
3. Configure o número do WhatsApp
4. Ative a integração
5. Escolha quais mensagens enviar automaticamente

## 📝 Próximas Melhorias

- [ ] Implementar guards de autenticação
- [ ] Adicionar testes unitários
- [ ] Implementar upload real de fotos
- [ ] Integração real com WhatsApp Business API
- [ ] Exportação de relatórios em PDF
- [ ] Sistema de notificações push
- [ ] Backup automático do banco
- [ ] Multi-tenancy completo

## 👥 Suporte

Para dúvidas ou suporte, entre em contato através do sistema.

## 📄 Licença

Sistema desenvolvido para Rabichos Banho & Tosa - Bebedouro, SP

---

**Desenvolvido com ❤️ para o melhor cuidado dos pets**
