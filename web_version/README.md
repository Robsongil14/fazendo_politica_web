# Fazendo Política - Versão Web

Uma aplicação web responsiva para gerenciamento de informações políticas municipais, adaptada do aplicativo React Native original.

## 🚀 Funcionalidades

- **Autenticação**: Sistema de login e cadastro com Supabase
- **Lista de Municípios**: Visualização e busca de municípios
- **Detalhes do Município**: Informações completas incluindo:
  - Dados básicos (população, eleitores, etc.)
  - Informações do prefeito e vice-prefeito
  - Lista de vereadores
  - Transferências governamentais com estatísticas
  - Links para redes sociais
- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **Edição de Dados**: Interface para editar informações dos municípios
- **Tema PSD**: Cores e identidade visual do partido

## 🛠️ Tecnologias Utilizadas

- **Next.js 14**: Framework React para aplicações web
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework CSS utilitário
- **Supabase**: Backend como serviço (autenticação e banco de dados)
- **Lucide React**: Ícones
- **Framer Motion**: Animações (configurado)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase com projeto configurado

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone [url-do-repositorio]
   cd web_version
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env.local
   
   # Edite o arquivo .env.local com suas credenciais do Supabase
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. **Configure o banco de dados**
   - Acesse seu projeto no Supabase
   - Execute os scripts SQL necessários para criar as tabelas:
     - `municipios`
     - `vereadores` 
     - `transferencias_governamentais`
   - Configure as políticas RLS (Row Level Security)

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação**
   - Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📱 Estrutura do Projeto

```
web_version/
├── src/
│   ├── app/                    # Páginas da aplicação (App Router)
│   │   ├── auth/              # Páginas de autenticação
│   │   │   ├── login/         # Página de login
│   │   │   └── signup/        # Página de cadastro
│   │   ├── municipios/        # Lista de municípios
│   │   ├── municipio/[id]/    # Detalhes do município
│   │   ├── globals.css        # Estilos globais
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página inicial (splash)
│   ├── contexts/              # Contextos React
│   │   └── AuthContext.tsx    # Contexto de autenticação
│   └── lib/                   # Utilitários
│       └── supabase.ts        # Configuração do Supabase
├── .env.local                 # Variáveis de ambiente (não commitado)
├── .env.example              # Exemplo de variáveis de ambiente
├── tailwind.config.js        # Configuração do Tailwind
├── next.config.js            # Configuração do Next.js
└── package.json              # Dependências do projeto
```

## 🎨 Personalização

### Cores do Tema PSD
As cores estão definidas no `tailwind.config.js`:
- **Azul PSD**: `#0065BD`
- **Verde PSD**: `#28A745` 
- **Amarelo PSD**: `#FFC107`

### Componentes Reutilizáveis
- **InfoCard**: Cartão de informação com suporte a edição e links
- **AuthContext**: Gerenciamento de estado de autenticação
- **Layout responsivo**: Grid system adaptativo

## 🔐 Autenticação e Segurança

- Autenticação via Supabase Auth
- Proteção de rotas com contexto de autenticação
- Row Level Security (RLS) no banco de dados
- Validação de formulários no frontend

## 📊 Funcionalidades Principais

### 1. Splash Screen
- Animação de entrada
- Redirecionamento automático baseado no estado de autenticação

### 2. Autenticação
- Login com email e senha
- Cadastro de novos usuários
- Logout seguro
- Validação de formulários

### 3. Lista de Municípios
- Busca em tempo real
- Grid responsivo
- Navegação para detalhes

### 4. Detalhes do Município
- Informações completas do município
- Edição inline de campos
- Transferências governamentais com estatísticas
- Links para redes sociais
- Lista de vereadores

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push

### Netlify
1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `.next`

### Outros Provedores
- Configure as variáveis de ambiente
- Execute `npm run build`
- Sirva os arquivos da pasta `.next`

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar versão de produção
npm start

# Linting
npm run lint
```

## 🐛 Solução de Problemas

### Erro de Conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique as políticas RLS

### Problemas de Build
- Limpe o cache: `rm -rf .next`
- Reinstale dependências: `rm -rf node_modules && npm install`

### Problemas de Estilo
- Verifique se o Tailwind CSS está configurado corretamente
- Confirme se os estilos globais estão sendo importados

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato através do email: [seu-email@exemplo.com]

## 🔄 Migração do React Native

Esta versão web foi adaptada do aplicativo React Native original, mantendo:
- ✅ Todas as funcionalidades principais
- ✅ Design e identidade visual
- ✅ Estrutura de dados
- ✅ Fluxos de navegação
- ✅ Integração com Supabase

### Principais Adaptações
- React Native → Next.js/React
- StyleSheet → Tailwind CSS
- Expo Router → Next.js App Router
- AsyncStorage → Supabase Session
- React Native components → HTML/CSS equivalents