# LIFT Dashboard - RD Station Integration

Dashboard completo para visualização de métricas do RD Station (Leads, Funil de Vendas, Email Marketing).

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do RD Station

# 3. Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 🔐 Configuração do RD Station OAuth

### 1. Criar App no RD Station Developers

1. Acesse: https://developers.rdstation.com/apps
2. Clique em "Criar novo aplicativo"
3. Preencha:
   - **Nome**: LIFT Dashboard
   - **Redirect URI**: `http://localhost:3000/api/auth/callback` (desenvolvimento)
   - **Scopes**: `contacts.read`, `deals.read`, `campaigns.read`
4. Salve e copie o **Client ID** e **Client Secret**

### 2. Configurar .env.local

```env
NEXT_PUBLIC_RDSTATION_CLIENT_ID=seu_client_id
RDSTATION_CLIENT_SECRET=seu_client_secret
NEXT_PUBLIC_RDSTATION_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### 3. Produção

Atualize o `NEXT_PUBLIC_RDSTATION_REDIRECT_URI` para seu domínio:
```
https://seu-dominio.com/api/auth/callback
```

E adicione essa URI nas configurações do App no RD Station Developers.

## 📊 Funcionalidades

### Métricas Principais (KPIs)
- Total de Contatos
- Negócios Ativos
- Valor Total do Pipeline
- Taxa de Conversão

### Funil de Vendas
- Visualização por estágio
- Contagem e valor por estágio
- Taxa de conversão entre estágios

### Série Temporal (30 dias)
- Novos contatos por dia
- Novos negócios por dia
- Valor gerado por dia

### Email Marketing
- Performance por campanha
- Enviados, Entregues, Abertos, Clicados
- Taxas de abertura, clique, bounce

### Origem dos Leads
- Distribuição por fonte
- Top 10 fontes

## 🛠 Stack Tecnológica

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Recharts** (gráficos)
- **Zustand** (estado)
- **Axios** (HTTP)
- **date-fns** (datas)

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/callback/   # OAuth callback
│   │   └── sync/            # Sincronização de dados
│   ├── dashboard/           # Página principal
│   ├── layout.tsx
│   └── page.tsx             # Redirect para /dashboard
├── components/
│   ├── dashboard/           # Componentes do dashboard
│   └── ui/                  # Componentes base (Card, Button)
├── lib/
│   ├── hooks/               # Custom hooks
│   ├── rdstation/           # API client & types
│   └── store/               # Zustand store
```

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Produção
npm run lint     # ESLint
```

## 📝 Como Obter Credenciais RD Station

1. Acesse [RD Station Developers](https://developers.rdstation.com/)
2. Faça login ou crie conta
3. Vá em "Meus Aplicativos" > "Novo Aplicativo"
4. Configure:
   - **Nome**: LIFT Dashboard
   - **URL de Redirecionamento**: `http://localhost:3000/api/auth/callback`
   - **Permissões**: Contatos (Leitura), Negócios (Leitura), Campanhas (Leitura)
5. Copie **Client ID** e **Client Secret**

## 🐛 Troubleshooting

### Erro "Configuração incompleta"
Verifique se `.env.local` tem todas as variáveis preenchidas.

### Erro "Invalid redirect_uri"
A URI no `.env.local` deve ser **idêntica** à cadastrada no RD Station Developers.

### Token expirado
O sistema renova automaticamente via refresh token. Se falhar, faça logout e login novamente.

### Dados não carregam
1. Verifique se o App tem as permissões corretas no RD Station
2. Confira os logs no console do navegador
3. Tente clicar em "Atualizar" no header

## 📄 Licença

MIT