# 🛠️ MANUAL DE SOLUÇÃO DE PROBLEMAS
## Fazendo Política Web - Troubleshooting Completo

---

## 🎯 SOBRE ESTE MANUAL

Este manual contém soluções para os problemas mais comuns que podem ocorrer com o sistema **Fazendo Política Web**.

**Organização:**
- 🚨 **Problemas Críticos**: Sistema não funciona
- ⚠️ **Problemas de Performance**: Sistema lento
- 🌐 **Problemas de Rede**: Acesso externo
- 🔧 **Problemas de Configuração**: Ajustes necessários
- 👥 **Problemas de Usuário**: Dificuldades de uso

---

## 🚨 PROBLEMAS CRÍTICOS

### ❌ PROBLEMA: Sistema não inicia após instalação

**Sintomas:**
- `pm2 status` mostra aplicação parada
- Erro ao acessar `http://localhost:3000`
- Mensagens de erro no `pm2 logs`

**Diagnóstico:**
```cmd
# Verificar status
pm2 status

# Ver logs de erro
pm2 logs fazendo-politica-web --err

# Verificar se Node.js está instalado
node --version

# Verificar se PM2 está instalado
pm2 --version
```

**Soluções:**

1. **Reinstalar dependências:**
```cmd
cd C:\FazendoPoliticaWeb
npm install --production
pm2 restart fazendo-politica-web
```

2. **Verificar arquivos essenciais:**
```cmd
# Verificar se existem os arquivos principais
dir C:\FazendoPoliticaWeb\package.json
dir C:\FazendoPoliticaWeb\.next
dir C:\FazendoPoliticaWeb\ecosystem.config.js
```

3. **Reiniciar PM2:**
```cmd
pm2 kill
pm2 start C:\FazendoPoliticaWeb\ecosystem.config.js
```

4. **Verificar porta em uso:**
```cmd
netstat -ano | findstr :3000
```

---

### ❌ PROBLEMA: "Access Denied" ou "Permissão Negada"

**Sintomas:**
- Erro de permissão durante instalação
- Scripts não executam
- Arquivos não são copiados

**Soluções:**

1. **Executar como Administrador:**
   - Clique com botão direito no arquivo `.bat`
   - Selecione "Executar como administrador"

2. **Verificar UAC (Controle de Conta de Usuário):**
   - Pressione `Win + R`
   - Digite `msconfig`
   - Vá para aba "Ferramentas"
   - Execute "Alterar configurações do UAC"
   - Defina para "Nunca notificar" temporariamente

3. **Verificar Antivírus:**
   - Adicione exceção para pasta `C:\FazendoPoliticaWeb`
   - Adicione exceção para arquivos `.bat`
   - Desative temporariamente o antivírus

---

### ❌ PROBLEMA: "Node.js não encontrado" após instalação

**Sintomas:**
- Comando `node --version` não funciona
- Erro "node is not recognized"
- PM2 não instala

**Soluções:**

1. **Reiniciar o computador:**
   - Feche todos os programas
   - Reinicie o Windows
   - Teste novamente

2. **Verificar PATH do sistema:**
```cmd
echo %PATH%
```
Deve conter algo como: `C:\Program Files\nodejs\`

3. **Reinstalar Node.js manualmente:**
   - Baixe de: https://nodejs.org
   - Execute como administrador
   - Marque "Add to PATH"

---

## ⚠️ PROBLEMAS DE PERFORMANCE

### 🐌 PROBLEMA: Sistema muito lento

**Sintomas:**
- Páginas demoram mais de 10 segundos para carregar
- Timeout de conexão
- Alta utilização de CPU/RAM

**Diagnóstico:**
```cmd
# Ver uso de recursos
pm2 monit

# Ver logs de performance
pm2 logs fazendo-politica-web

# Verificar memória disponível
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value
```

**Soluções:**

1. **Reiniciar aplicação:**
```cmd
pm2 restart fazendo-politica-web
```

2. **Aumentar limite de memória:**
```cmd
# Editar ecosystem.config.js
# Alterar max_memory_restart para "1G" ou "2G"
pm2 restart fazendo-politica-web
```

3. **Verificar espaço em disco:**
```cmd
dir C:\ | findstr "bytes free"
```

4. **Limpar cache do navegador:**
   - Pressione `Ctrl + Shift + Delete`
   - Selecione "Imagens e arquivos em cache"
   - Clique em "Limpar dados"

---

### 🔄 PROBLEMA: Aplicação reinicia constantemente

**Sintomas:**
- PM2 mostra muitos restarts
- Logs mostram crashes frequentes
- Sistema instável

**Diagnóstico:**
```cmd
# Ver histórico de restarts
pm2 status

# Ver logs de crash
pm2 logs fazendo-politica-web --err --lines 50
```

**Soluções:**

1. **Verificar logs de erro:**
```cmd
pm2 logs fazendo-politica-web --err
```

2. **Aumentar limite de memória:**
```javascript
// Em ecosystem.config.js
max_memory_restart: '2G'
```

3. **Verificar dependências:**
```cmd
cd C:\FazendoPoliticaWeb
npm audit
npm audit fix
```

---

## 🌐 PROBLEMAS DE REDE

### 🚫 PROBLEMA: Não consegue acessar de outros computadores

**Sintomas:**
- `http://localhost:3000` funciona
- `http://[IP_LOCAL]:3000` não funciona
- Timeout de conexão

**Diagnóstico:**
```cmd
# Verificar se aplicação está ouvindo na porta correta
netstat -ano | findstr :3000

# Testar conectividade local
telnet localhost 3000

# Verificar firewall
netsh advfirewall firewall show rule name="Fazendo Politica Web"
```

**Soluções:**

1. **Configurar firewall:**
```cmd
# Execute como administrador
netsh advfirewall firewall add rule name="Fazendo Politica Web" dir=in action=allow protocol=TCP localport=3000
```

2. **Verificar configuração do PM2:**
```javascript
// Em ecosystem.config.js, verificar:
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  HOST: '0.0.0.0'  // Importante para aceitar conexões externas
}
```

3. **Testar com firewall desabilitado:**
```cmd
# TEMPORARIAMENTE - apenas para teste
netsh advfirewall set allprofiles state off
# Teste o acesso
# Reabilite depois:
netsh advfirewall set allprofiles state on
```

---

### 🌍 PROBLEMA: Não consegue acessar da internet

**Sintomas:**
- Acesso local e na rede funcionam
- Acesso externo não funciona
- Port forwarding configurado

**Diagnóstico:**
```cmd
# Verificar IP público
curl ifconfig.me

# Testar porta externamente (use site online)
# https://www.yougetsignal.com/tools/open-ports/
```

**Soluções:**

1. **Verificar port forwarding no roteador:**
   - Acesse o roteador (geralmente 192.168.1.1)
   - Vá para Port Forwarding/Virtual Server
   - Verifique se está configurado:
     - Porta externa: 3000
     - Porta interna: 3000
     - IP interno: [IP do servidor]
     - Protocolo: TCP

2. **Verificar se provedor bloqueia porta:**
   - Alguns provedores bloqueiam porta 3000
   - Teste com porta 8080 ou 8000
   - Configure no ecosystem.config.js e roteador

3. **Verificar IP público dinâmico:**
   - IP público pode mudar
   - Use serviço de DNS dinâmico (No-IP, DynDNS)
   - Configure no roteador

---

## 🔧 PROBLEMAS DE CONFIGURAÇÃO

### ⚙️ PROBLEMA: Variáveis de ambiente não funcionam

**Sintomas:**
- Conexão com banco de dados falha
- APIs externas não funcionam
- Configurações não são aplicadas

**Diagnóstico:**
```cmd
# Verificar se arquivo .env.local existe
dir C:\FazendoPoliticaWeb\.env.local

# Ver conteúdo do arquivo
type C:\FazendoPoliticaWeb\.env.local
```

**Soluções:**

1. **Criar/corrigir arquivo .env.local:**
```env
# Exemplo de configuração
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

2. **Verificar formato do arquivo:**
   - Sem espaços antes/depois do `=`
   - Uma variável por linha
   - Sem aspas desnecessárias

3. **Reiniciar após alterações:**
```cmd
pm2 restart fazendo-politica-web
```

---

### 📁 PROBLEMA: Arquivos não encontrados

**Sintomas:**
- Erro 404 para arquivos estáticos
- Imagens não carregam
- CSS/JS não funciona

**Diagnóstico:**
```cmd
# Verificar estrutura de pastas
dir C:\FazendoPoliticaWeb
dir C:\FazendoPoliticaWeb\.next
dir C:\FazendoPoliticaWeb\public
```

**Soluções:**

1. **Reexecutar deploy:**
```cmd
# Na pasta SERVIDOR_PRODUCAO
deploy_aplicacao.bat
```

2. **Verificar permissões de pasta:**
```cmd
# Dar permissão total para pasta
icacls "C:\FazendoPoliticaWeb" /grant Everyone:F /T
```

3. **Verificar build da aplicação:**
```cmd
cd C:\FazendoPoliticaWeb
npm run build
```

---

## 👥 PROBLEMAS DE USUÁRIO

### 🔐 PROBLEMA: Usuários não conseguem fazer login

**Sintomas:**
- Erro de autenticação
- Página de login não funciona
- Sessões expiram rapidamente

**Soluções:**

1. **Verificar configuração de autenticação:**
   - Confirme configurações do Supabase
   - Verifique URLs de callback
   - Teste credenciais de administrador

2. **Limpar cache do navegador:**
   - Pressione `Ctrl + Shift + Delete`
   - Limpe cookies e dados de site

3. **Verificar logs de autenticação:**
```cmd
pm2 logs fazendo-politica-web | findstr "auth"
```

---

### 📊 PROBLEMA: Dados não carregam

**Sintomas:**
- Tabelas vazias
- Gráficos não aparecem
- Erro de conexão com banco

**Soluções:**

1. **Verificar conexão com banco:**
   - Teste credenciais do Supabase
   - Verifique se banco está online
   - Confirme configurações de RLS

2. **Verificar logs de API:**
```cmd
pm2 logs fazendo-politica-web | findstr "API"
```

3. **Testar endpoints manualmente:**
   - Use Postman ou navegador
   - Teste URLs da API diretamente

---

## 🔍 FERRAMENTAS DE DIAGNÓSTICO

### Comandos Úteis para Diagnóstico:

```cmd
# Status geral do sistema
pm2 status
pm2 logs fazendo-politica-web --lines 20

# Informações de rede
ipconfig /all
netstat -ano | findstr :3000

# Uso de recursos
wmic process where name="node.exe" get ProcessId,PageFileUsage,WorkingSetSize
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value

# Verificar serviços
sc query | findstr "PM2"
tasklist | findstr "node.exe"

# Testar conectividade
ping google.com
telnet localhost 3000

# Verificar firewall
netsh advfirewall firewall show rule name="Fazendo Politica Web"

# Verificar portas abertas
netsh interface portproxy show all
```

### Scripts de Diagnóstico Automático:

Crie um arquivo `diagnostico.bat`:
```batch
@echo off
echo ========================================
echo DIAGNÓSTICO FAZENDO POLÍTICA WEB
echo ========================================
echo.

echo [1] Status PM2:
pm2 status
echo.

echo [2] Logs recentes:
pm2 logs fazendo-politica-web --lines 10
echo.

echo [3] Uso de porta 3000:
netstat -ano | findstr :3000
echo.

echo [4] Informações de rede:
ipconfig | findstr "IPv4"
echo.

echo [5] Espaço em disco:
dir C:\ | findstr "bytes free"
echo.

echo [6] Verificar arquivos essenciais:
if exist "C:\FazendoPoliticaWeb\package.json" (echo ✓ package.json) else (echo ✗ package.json)
if exist "C:\FazendoPoliticaWeb\.next" (echo ✓ .next) else (echo ✗ .next)
if exist "C:\FazendoPoliticaWeb\ecosystem.config.js" (echo ✓ ecosystem.config.js) else (echo ✗ ecosystem.config.js)

pause
```

---

## 📞 QUANDO PEDIR AJUDA

### Antes de Pedir Suporte:

1. **Execute o diagnóstico automático**
2. **Anote as mensagens de erro exatas**
3. **Tire screenshots dos problemas**
4. **Teste as soluções básicas deste manual**

### Informações para Fornecer ao Suporte:

- **Sistema operacional** e versão
- **Versão do Node.js**: `node --version`
- **Status do PM2**: `pm2 status`
- **Logs de erro**: `pm2 logs fazendo-politica-web --err --lines 20`
- **Configuração de rede**: IP local e público
- **Passos que levaram ao problema**
- **Soluções já tentadas**

### Logs Importantes:

```cmd
# Salvar logs para envio
pm2 logs fazendo-politica-web --lines 100 > logs_sistema.txt
pm2 logs fazendo-politica-web --err --lines 50 > logs_erro.txt
```

---

## ✅ CHECKLIST DE MANUTENÇÃO PREVENTIVA

### Diário:
- [ ] Verificar se aplicação está rodando: `pm2 status`
- [ ] Monitorar uso de recursos: `pm2 monit`

### Semanal:
- [ ] Verificar logs de erro: `pm2 logs --err`
- [ ] Testar acesso local e externo
- [ ] Verificar espaço em disco
- [ ] Fazer backup da aplicação

### Mensal:
- [ ] Atualizar dependências: `npm audit fix`
- [ ] Verificar atualizações do Windows
- [ ] Revisar configurações de firewall
- [ ] Testar procedimentos de recuperação

---

**🎯 Lembre-se**: A maioria dos problemas pode ser resolvida com reinicialização da aplicação (`pm2 restart fazendo-politica-web`) ou do sistema. Sempre tente as soluções mais simples primeiro!