# Guia de Configuração do Servidor Local

Este guia te ajudará a configurar um servidor local na sua casa para hospedar a aplicação web do Fazendo Política.

## Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **Git** (para controle de versão)
3. **Computador dedicado** (pode ser um PC comum)
4. **Conexão de internet estável**

## Passo 1: Preparar o Computador Servidor

### 1.1 Instalar Node.js
1. Acesse https://nodejs.org/
2. Baixe a versão LTS (recomendada)
3. Execute o instalador e siga as instruções
4. Verifique a instalação:
   ```bash
   node --version
   npm --version
   ```

### 1.2 Instalar Git
1. Acesse https://git-scm.com/
2. Baixe e instale o Git
3. Configure seu usuário:
   ```bash
   git config --global user.name "Seu Nome"
   git config --global user.email "seu@email.com"
   ```

## Passo 2: Configurar a Aplicação

### 2.1 Clonar o Projeto
```bash
# Navegue até onde quer salvar o projeto
cd C:\
mkdir servidor-fazendo-politica
cd servidor-fazendo-politica

# Clone o projeto (substitua pela URL do seu repositório)
git clone [URL_DO_SEU_REPOSITORIO] .
```

### 2.2 Instalar Dependências
```bash
cd web_version
npm install
```

### 2.3 Configurar Variáveis de Ambiente
1. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. Edite o arquivo `.env.local` com suas configurações do Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

## Passo 3: Configurar para Produção

### 3.1 Build da Aplicação
```bash
npm run build
```

### 3.2 Testar Localmente
```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## Passo 4: Configurar Acesso Externo

### 4.1 Descobrir o IP Local
No Windows, abra o Prompt de Comando e digite:
```bash
ipconfig
```
Anote o "Endereço IPv4" (exemplo: 192.168.1.100)

### 4.2 Configurar o Firewall
1. Abra o "Windows Defender Firewall"
2. Clique em "Configurações avançadas"
3. Clique em "Regras de entrada" → "Nova regra"
4. Selecione "Porta" → "TCP" → "Portas locais específicas" → "3000"
5. Permita a conexão
6. Aplique a todas as redes
7. Nomeie a regra como "Fazendo Política Web"

### 4.3 Configurar o Roteador (Opcional - para acesso pela internet)
1. Acesse o painel do seu roteador (geralmente 192.168.1.1)
2. Procure por "Port Forwarding" ou "Redirecionamento de Porta"
3. Crie uma regra:
   - Porta externa: 80 (ou outra de sua escolha)
   - Porta interna: 3000
   - IP de destino: IP do seu computador servidor
4. Salve as configurações

## Passo 5: Automatizar a Inicialização

### 5.1 Criar Script de Inicialização (Windows)
Crie um arquivo `iniciar-servidor.bat`:
```batch
@echo off
cd /d C:\servidor-fazendo-politica\web_version
npm start
pause
```

### 5.2 Configurar Inicialização Automática
1. Pressione `Win + R`, digite `shell:startup`
2. Copie o arquivo `iniciar-servidor.bat` para esta pasta
3. O servidor iniciará automaticamente quando o Windows iniciar

## Passo 6: Monitoramento e Manutenção

### 6.1 Logs da Aplicação
Os logs aparecerão no terminal onde o servidor está rodando.

### 6.2 Atualizações
Para atualizar a aplicação:
```bash
git pull origin main
npm install
npm run build
# Reinicie o servidor
```

### 6.3 Backup
Faça backup regular de:
- Código fonte
- Arquivo `.env.local`
- Dados do banco (se aplicável)

## Passo 7: Acesso à Aplicação

### 7.1 Acesso Local
- Na mesma rede: `http://[IP_DO_SERVIDOR]:3000`
- Exemplo: `http://192.168.1.100:3000`

### 7.2 Acesso Externo (se configurado)
- Pela internet: `http://[SEU_IP_PUBLICO]:80`
- Para descobrir seu IP público: https://whatismyipaddress.com/

## Solução de Problemas

### Problema: Porta 3000 já está em uso
```bash
# Encontrar processo usando a porta
netstat -ano | findstr :3000
# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID [PID] /F
```

### Problema: Não consegue acessar de outros dispositivos
1. Verifique o firewall
2. Confirme o IP do servidor
3. Teste com `ping [IP_DO_SERVIDOR]`

### Problema: Aplicação não inicia
1. Verifique se o Node.js está instalado
2. Confirme se as dependências foram instaladas (`npm install`)
3. Verifique o arquivo `.env.local`

## Segurança

### Recomendações:
1. **Firewall**: Mantenha apenas as portas necessárias abertas
2. **Atualizações**: Mantenha o sistema operacional atualizado
3. **Backup**: Faça backups regulares
4. **Monitoramento**: Monitore logs regularmente
5. **HTTPS**: Para produção, configure SSL/TLS

### Para HTTPS (Opcional):
1. Obtenha um certificado SSL (Let's Encrypt é gratuito)
2. Configure um proxy reverso (nginx ou Apache)
3. Redirecione HTTP para HTTPS

## Contato e Suporte

Se encontrar problemas:
1. Verifique os logs da aplicação
2. Consulte a documentação do Next.js
3. Verifique as configurações do Supabase

---

**Nota**: Este guia assume conhecimento básico de informática. Para ambientes de produção críticos, considere contratar um profissional de TI.