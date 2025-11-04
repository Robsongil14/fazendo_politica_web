# 🖥️ GUIA COMPLETO - SERVIDOR DE PRODUÇÃO
## Fazendo Política Web - Configuração para Servidor Dedicado

---

## 📋 PRÉ-REQUISITOS

### Hardware Mínimo Recomendado:
- **CPU**: 2 cores
- **RAM**: 4GB
- **Armazenamento**: 20GB livres
- **Rede**: Conexão estável à internet

### Sistema Operacional:
- Windows 10/11 ou Windows Server 2016+
- Acesso de administrador

---

## 🚀 INSTALAÇÃO RÁPIDA (3 PASSOS)

### PASSO 1: Preparar o Servidor
1. **Copie esta pasta** `SERVIDOR_PRODUCAO` para o servidor
2. **Clique com botão direito** em `instalar_servidor.bat`
3. **Selecione**: "Executar como administrador"
4. **Aguarde** a instalação automática (5-10 minutos)

### PASSO 2: Fazer Deploy da Aplicação
1. **Execute**: `deploy_aplicacao.bat`
2. **Aguarde** o processo de deploy (2-3 minutos)
3. **Verifique** se a aplicação está rodando

### PASSO 3: Configurar Acesso Externo
1. **Configure port forwarding** no roteador (porta 3000)
2. **Teste o acesso** local e externo
3. **Anote o IP público** para acesso remoto

---

## 📁 ESTRUTURA DE ARQUIVOS

```
SERVIDOR_PRODUCAO/
├── instalar_servidor.bat      # Instalação automática
├── deploy_aplicacao.bat       # Deploy da aplicação
├── verificar_status.bat       # Verificar status
├── configurar_rede.bat        # Configuração de rede
├── backup_aplicacao.bat       # Backup automático
└── GUIA_SERVIDOR_PRODUCAO.md  # Este guia
```

**Após instalação:**
```
C:\FazendoPoliticaWeb/
├── .next/                     # Build da aplicação
├── public/                    # Arquivos estáticos
├── node_modules/              # Dependências
├── package.json               # Configuração
├── ecosystem.config.js        # Configuração PM2
├── iniciar_servidor.bat       # Iniciar serviço
└── parar_servidor.bat         # Parar serviço
```

---

## 🔧 CONFIGURAÇÃO DETALHADA

### O que o `instalar_servidor.bat` faz:

1. **Verifica privilégios** de administrador
2. **Instala Node.js** (se não estiver instalado)
3. **Instala PM2** para gerenciar processos
4. **Cria diretório** `C:\FazendoPoliticaWeb`
5. **Configura Firewall** (porta 3000)
6. **Cria serviço Windows** para inicialização automática
7. **Agenda tarefa** para iniciar com o sistema

### O que o `deploy_aplicacao.bat` faz:

1. **Para serviços** em execução
2. **Copia arquivos** da aplicação
3. **Instala dependências** de produção
4. **Configura PM2** com otimizações
5. **Inicia aplicação** automaticamente

---

## 🌐 CONFIGURAÇÃO DE REDE

### Descobrir IP Local:
```cmd
ipconfig | findstr "IPv4"
```

### Configurar Port Forwarding no Roteador:
1. **Acesse**: http://192.168.1.1 (ou IP do roteador)
2. **Vá para**: Port Forwarding / Virtual Servers
3. **Configure**:
   - **Porta Externa**: 3000
   - **Porta Interna**: 3000
   - **IP Interno**: [IP do servidor]
   - **Protocolo**: TCP

### Descobrir IP Público:
```cmd
curl ifconfig.me
```
ou acesse: https://whatismyipaddress.com

---

## 📊 MONITORAMENTO E CONTROLE

### Comandos Úteis:

```cmd
# Ver status da aplicação
pm2 status

# Ver logs em tempo real
pm2 logs

# Reiniciar aplicação
pm2 restart fazendo-politica-web

# Parar aplicação
pm2 stop fazendo-politica-web

# Iniciar aplicação
pm2 start ecosystem.config.js

# Ver uso de recursos
pm2 monit
```

### Scripts de Controle:
- **Iniciar**: `C:\FazendoPoliticaWeb\iniciar_servidor.bat`
- **Parar**: `C:\FazendoPoliticaWeb\parar_servidor.bat`

---

## 🔒 SEGURANÇA

### Firewall Configurado:
- ✅ Porta 3000 liberada para entrada
- ✅ Apenas protocolo TCP
- ✅ Regra nomeada "Fazendo Politica Web"

### Recomendações Adicionais:
1. **Mantenha o Windows atualizado**
2. **Use senhas fortes** para contas de usuário
3. **Configure backup** regular dos dados
4. **Monitore logs** regularmente
5. **Considere usar HTTPS** em produção

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### Aplicação não inicia:
```cmd
# Verificar se Node.js está instalado
node --version

# Verificar se PM2 está instalado
pm2 --version

# Verificar logs de erro
pm2 logs fazendo-politica-web --err
```

### Não consegue acessar externamente:
1. **Verifique firewall** do Windows
2. **Confirme port forwarding** no roteador
3. **Teste acesso local** primeiro: http://localhost:3000
4. **Verifique IP** do servidor na rede

### Aplicação lenta:
```cmd
# Ver uso de recursos
pm2 monit

# Reiniciar aplicação
pm2 restart fazendo-politica-web

# Verificar logs
pm2 logs
```

### Erro de permissão:
1. **Execute como administrador**
2. **Verifique antivírus** (pode bloquear)
3. **Desative UAC** temporariamente

---

## 🔄 ATUALIZAÇÕES

### Para atualizar a aplicação:
1. **Copie novos arquivos** para a pasta do projeto
2. **Execute novamente**: `deploy_aplicacao.bat`
3. **Verifique** se tudo está funcionando

### Backup antes de atualizar:
```cmd
# Fazer backup da pasta atual
xcopy /E /Y "C:\FazendoPoliticaWeb" "C:\Backup_FazendoPolitica_%date%\"
```

---

## 📞 INFORMAÇÕES DE ACESSO

### URLs de Acesso:
- **Local**: http://localhost:3000
- **Rede Local**: http://[IP_LOCAL]:3000
- **Internet**: http://[IP_PUBLICO]:3000

### Portas Utilizadas:
- **3000**: Aplicação web principal
- **PM2**: Gerenciamento interno (não exposto)

---

## ✅ CHECKLIST DE VERIFICAÇÃO

### Após Instalação:
- [ ] Node.js instalado e funcionando
- [ ] PM2 instalado globalmente
- [ ] Firewall configurado (porta 3000)
- [ ] Diretório criado: `C:\FazendoPoliticaWeb`
- [ ] Inicialização automática configurada

### Após Deploy:
- [ ] Aplicação rodando: `pm2 status`
- [ ] Acesso local funcionando: http://localhost:3000
- [ ] Logs sem erros: `pm2 logs`
- [ ] Processo estável por 5+ minutos

### Para Acesso Externo:
- [ ] Port forwarding configurado no roteador
- [ ] IP público identificado
- [ ] Teste de acesso externo realizado
- [ ] DNS configurado (opcional)

---

## 📋 LOGS E MONITORAMENTO

### Localização dos Logs:
- **PM2 Logs**: `%USERPROFILE%\.pm2\logs\`
- **Windows Event Log**: Event Viewer > Applications
- **Aplicação**: Logs via `pm2 logs`

### Monitoramento Automático:
- **PM2** reinicia automaticamente em caso de crash
- **Windows Task** inicia PM2 com o sistema
- **Health Check** interno do Next.js

---

**🎉 Servidor configurado com sucesso!**
**📧 Para suporte: [seu-email@exemplo.com]**