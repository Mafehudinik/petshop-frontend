# 🛠️ Comandos Úteis - Sistema Pet Shop

## 📦 Instalação Inicial

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 🚀 Executar o Sistema

### Backend (Terminal 1)
```bash
cd backend
npm start
```

### Frontend (Terminal 2)
```bash
cd frontend
ionic serve
```

## 🗄️ Banco de Dados

### Inicializar banco
```bash
cd backend
node init-db.js
```

### Resetar banco (apaga tudo e recria)
```bash
cd backend
rm petshop.db
node init-db.js
```

### Ver estrutura do banco
```bash
cd backend
sqlite3 petshop.db
.schema
.quit
```

### Fazer backup do banco
```bash
cd backend
cp petshop.db petshop_backup_$(date +%Y%m%d).db
```

## 🔧 Desenvolvimento

### Backend com auto-reload
```bash
cd backend
npm install -g nodemon
nodemon src/server.js
```

### Frontend com live reload
```bash
cd frontend
ionic serve --lab
```

### Verificar erros TypeScript
```bash
cd frontend
npm run lint
```

## 📱 Build para Produção

### Frontend - Build
```bash
cd frontend
ionic build --prod
```

### Frontend - Build para Android
```bash
cd frontend
ionic capacitor add android
ionic build
ionic capacitor sync
ionic capacitor open android
```

### Frontend - Build para iOS
```bash
cd frontend
ionic capacitor add ios
ionic build
ionic capacitor sync
ionic capacitor open ios
```

## 🧪 Testes

### Testar API com curl

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rabichos.com","password":"admin123"}'
```

#### Listar clientes
```bash
curl http://localhost:8000/api/clients \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Criar cliente
```bash
curl -X POST http://localhost:8000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"name":"João Silva","phone":"16999999999","email":"joao@email.com"}'
```

## 🔍 Debug

### Ver logs do backend
```bash
cd backend
npm start | tee backend.log
```

### Ver logs do frontend
```bash
cd frontend
ionic serve > frontend.log 2>&1
```

### Verificar porta em uso
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :8100

# Linux/Mac
lsof -i :8000
lsof -i :8100
```

### Matar processo na porta
```bash
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

## 📊 Banco de Dados - Queries Úteis

### Ver todos os clientes
```sql
sqlite3 backend/petshop.db "SELECT * FROM clients;"
```

### Ver todos os pets
```sql
sqlite3 backend/petshop.db "SELECT * FROM pets;"
```

### Ver agendamentos de hoje
```sql
sqlite3 backend/petshop.db "SELECT * FROM appointments WHERE appointment_date = date('now');"
```

### Ver vendas do mês
```sql
sqlite3 backend/petshop.db "SELECT * FROM sales WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now');"
```

### Contar registros
```sql
sqlite3 backend/petshop.db "
SELECT 
  (SELECT COUNT(*) FROM clients) as clientes,
  (SELECT COUNT(*) FROM pets) as pets,
  (SELECT COUNT(*) FROM appointments) as agendamentos,
  (SELECT COUNT(*) FROM sales) as vendas;
"
```

## 🧹 Limpeza

### Limpar node_modules
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Limpar cache do Ionic
```bash
cd frontend
ionic cache clear
```

### Limpar build
```bash
cd frontend
rm -rf www .angular
```

## 📦 Dependências

### Atualizar dependências do backend
```bash
cd backend
npm update
npm audit fix
```

### Atualizar dependências do frontend
```bash
cd frontend
npm update
npm audit fix
```

### Ver dependências desatualizadas
```bash
npm outdated
```

## 🔐 Segurança

### Gerar nova SECRET_KEY para JWT
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Verificar vulnerabilidades
```bash
npm audit
npm audit fix
```

## 📝 Git

### Inicializar repositório
```bash
git init
git add .
git commit -m "Initial commit - Sistema Pet Shop Rabichos"
```

### Criar .gitignore
```bash
cat > .gitignore << EOF
# Node
node_modules/
npm-debug.log
package-lock.json

# Environment
.env
.env.local

# Database
*.db
*.sqlite

# Build
dist/
www/
.angular/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF
```

## 🌐 Deploy

### Backend - PM2
```bash
npm install -g pm2
cd backend
pm2 start src/server.js --name petshop-api
pm2 save
pm2 startup
```

### Frontend - Nginx
```bash
cd frontend
ionic build --prod
# Copiar conteúdo de www/ para /var/www/html/
```

## 📊 Monitoramento

### Ver status PM2
```bash
pm2 status
pm2 logs petshop-api
pm2 monit
```

### Ver uso de recursos
```bash
# CPU e Memória
top
htop

# Espaço em disco
df -h
```

## 🔄 Backup e Restore

### Backup completo
```bash
# Criar pasta de backup
mkdir -p backups/$(date +%Y%m%d)

# Backup do banco
cp backend/petshop.db backups/$(date +%Y%m%d)/

# Backup de uploads (se houver)
cp -r backend/uploads backups/$(date +%Y%m%d)/

# Criar arquivo compactado
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz backups/$(date +%Y%m%d)
```

### Restore do backup
```bash
# Extrair backup
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz

# Restaurar banco
cp backups/YYYYMMDD/petshop.db backend/

# Restaurar uploads
cp -r backups/YYYYMMDD/uploads backend/
```

## 🐛 Troubleshooting

### Erro: Cannot find module
```bash
cd backend  # ou frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro: Port already in use
```bash
# Mudar porta no .env (backend)
PORT=8001

# Mudar porta no ionic (frontend)
ionic serve --port=8101
```

### Erro: Database locked
```bash
# Fechar todas as conexões
cd backend
rm petshop.db-journal
# Reiniciar servidor
```

### Erro: CORS
```bash
# Verificar se backend está rodando
# Verificar URL no environment.ts
# Verificar configuração CORS no server.js
```

## 📱 Comandos Ionic

### Criar nova página
```bash
ionic generate page pages/nova-pagina
```

### Criar novo serviço
```bash
ionic generate service services/novo-servico
```

### Criar componente
```bash
ionic generate component components/novo-componente
```

### Ver informações do projeto
```bash
ionic info
```

## 🎯 Atalhos Úteis

### Abrir tudo de uma vez (Windows)
```bash
# Criar arquivo start.bat
@echo off
start cmd /k "cd backend && npm start"
timeout /t 2
start cmd /k "cd frontend && ionic serve"
```

### Abrir tudo de uma vez (Linux/Mac)
```bash
# Criar arquivo start.sh
#!/bin/bash
cd backend && npm start &
sleep 2
cd frontend && ionic serve
```

## 📚 Documentação

### Gerar documentação do código
```bash
npm install -g typedoc
cd frontend
typedoc --out docs src/
```

### Ver documentação da API
```bash
# Abrir no navegador
http://localhost:8000/api-docs
```

## ✅ Checklist de Deploy

- [ ] Atualizar dependências
- [ ] Executar testes
- [ ] Build de produção
- [ ] Backup do banco
- [ ] Configurar variáveis de ambiente
- [ ] Configurar HTTPS
- [ ] Configurar domínio
- [ ] Testar em produção
- [ ] Monitorar logs
- [ ] Configurar backup automático

---

**Dica**: Salve este arquivo e use como referência rápida! 🚀
