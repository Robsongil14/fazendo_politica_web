// Configuração de demonstração - substitua pela configuração real do Supabase
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Simulação de login para demonstração
      if (email === 'demo@exemplo.com' && password === 'demo123') {
        const user = { 
          id: '1', 
          email: 'demo@exemplo.com',
          aud: 'authenticated',
          role: 'authenticated',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const session = { 
          access_token: 'demo-token',
          refresh_token: 'demo-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user
        };
        return {
          data: { user, session },
          error: null
        };
      }
      return {
        data: { user: null, session: null },
        error: { message: 'Credenciais inválidas' }
      };
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      // Simulação de cadastro para demonstração
      return {
        data: {
          user: { id: '2', email },
          session: null
        },
        error: null
      };
    },
    signOut: async () => {
      return { error: null };
    },
    getSession: async () => {
      return {
        data: { session: null },
        error: null
      };
    },
    onAuthStateChange: (callback: any) => {
      // Simulação de mudança de estado
      // Simula que não há usuário logado inicialmente
      setTimeout(() => {
        callback('INITIAL_SESSION', null);
      }, 100);
      
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          if (table === 'municipios') {
            return {
              data: {
                id: '1',
                municipio: 'Salvador',
                populacao: '2.886.698',
                eleitores: '1.956.234',
                prefeito: 'Bruno Reis',
                partido: 'União Brasil',
                votos_recebidos: '1.043.677',
                telefone: '(71) 3202-9000',
                instagram_prefeito: '@brunoreis',
                instagram_prefeitura: '@prefeituradesalvador'
              },
              error: null
            };
          }
          return { data: null, error: null };
        },
        order: (column: string, options?: any) => ({
          limit: (count: number) => ({
            async then(callback: any) {
              if (table === 'municipios') {
                const municipios = [
                  { id: '1', municipio: 'Salvador', populacao: '2.886.698' },
                  { id: '2', municipio: 'Feira de Santana', populacao: '619.609' },
                  { id: '3', municipio: 'Vitória da Conquista', populacao: '341.128' },
                  { id: '4', municipio: 'Camaçari', populacao: '304.302' },
                  { id: '5', municipio: 'Juazeiro', populacao: '218.162' }
                ];
                return callback({ data: municipios, error: null });
              }
              return callback({ data: [], error: null });
            }
          })
        })
      }),
      ilike: (column: string, pattern: string) => ({
        order: (column: string, options?: any) => ({
          async then(callback: any) {
            if (table === 'municipios') {
              const municipios = [
                { id: '1', municipio: 'Salvador', populacao: '2.886.698' },
                { id: '2', municipio: 'Feira de Santana', populacao: '619.609' }
              ];
              return callback({ data: municipios, error: null });
            }
            return callback({ data: [], error: null });
          }
        })
      }),
      order: (column: string, options?: any) => ({
        async then(callback: any) {
          if (table === 'municipios') {
            const municipios = [
              { id: '1', municipio: 'Salvador', populacao: '2.886.698' },
              { id: '2', municipio: 'Feira de Santana', populacao: '619.609' },
              { id: '3', municipio: 'Vitória da Conquista', populacao: '341.128' },
              { id: '4', municipio: 'Camaçari', populacao: '304.302' },
              { id: '5', municipio: 'Juazeiro', populacao: '218.162' }
            ];
            return callback({ data: municipios, error: null });
          } else if (table === 'vereadores') {
            const vereadores = [
              { id: '1', nome: 'João Silva', partido: 'PSD', votos_recebidos: '5.432' },
              { id: '2', nome: 'Maria Santos', partido: 'União Brasil', votos_recebidos: '4.876' }
            ];
            return callback({ data: vereadores, error: null });
          } else if (table === 'transferencias_governamentais') {
            const transferencias = [
              {
                id: '1',
                ministerio: 'Ministério da Saúde',
                acao: 'Construção de UBS',
                proposta: 'Construção de Unidade Básica de Saúde',
                situacao_proposta: 'Empenhado',
                valor: 500000,
                valor_empenho: 450000,
                convenio: 'CV-2024-001',
                empenho: 'EMP-2024-001',
                data_emissao: '2024-01-15'
              }
            ];
            return callback({ data: transferencias, error: null });
          }
          return callback({ data: [], error: null });
        }
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        async then(callback: any) {
          return callback({ data: null, error: null });
        }
      })
    })
  })
};

export const signInWithEmail = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

import { User } from '@supabase/supabase-js';
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getSession();
  if (data.session && data.session.user) {
    return data.session.user;
  }
  return null;
};