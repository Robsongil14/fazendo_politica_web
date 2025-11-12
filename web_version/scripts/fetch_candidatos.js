#!/usr/bin/env node
// Small helper to fetch candidatos_prefeito_ba_2024 for a given municipality name or id
const { createClient } = require('@supabase/supabase-js');

// Simple .env.local parser (avoid adding dotenv as dependency)
const fs = require('fs');
const envPath = './.env.local';
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    // only set if not already in process.env
    if (!process.env[key]) process.env[key] = val.replace(/^"|"$/g, '');
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars. Please ensure web_version/.env.local exists and has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node fetch_candidatos.js <municipio_name_or_id>');
    process.exit(1);
  }

  // Determine whether user passed an ID or a municipality name.
  let municipioId = null;
  let municipioName = null;
  if (/^\d+$/.test(arg)) {
    municipioId = parseInt(arg, 10);
  } else {
    municipioName = arg.toUpperCase();
  }

  // Query candidatos_prefeito_ba_2024
  let data, error;
  if (municipioName) {
    // table stores municipality in a text column 'municipio'
    ({ data, error } = await supabase
      .from('candidatos_prefeito_ba_2024')
      .select('*')
      .ilike('municipio', municipioName)
      .order('votos', { ascending: false }));
  } else {
    ({ data, error } = await supabase
      .from('candidatos_prefeito_ba_2024')
      .select('*')
      .eq('municipio_id', municipioId)
      .order('votos', { ascending: false }));
  }

  if (error) {
    console.error('Query error (primary table):', error.message || error);
    console.log('Attempting to inspect table schema / sample rows to find municipality linkage...');
    // Try a generic select to inspect columns
    const { data: sample, error: sampleErr } = await supabase
      .from('candidatos_prefeito_ba_2024')
      .select('*')
      .limit(10);
    if (sampleErr) {
      console.error('Unable to inspect table candidatos_prefeito_ba_2024:', sampleErr.message || sampleErr);
    } else {
      console.log('Sample rows (first 5):');
      console.log(JSON.stringify(sample.slice(0, 5), null, 2));
      if (sample && sample.length > 0) {
        console.log('Detected columns:', Object.keys(sample[0]).join(', '));
      }
    }
    // try fallback table name candidatos_prefeito
    const { data: data2, error: error2 } = await supabase
      .from('candidatos_prefeito')
      .select('*')
      .limit(10);
    if (error2) {
      console.error('Fallback table candidatos_prefeito not available or error:', error2.message || error2);
    } else {
      console.log('Fallback sample rows (candidatos_prefeito):');
      console.log(JSON.stringify(data2.slice(0, 5), null, 2));
      if (data2 && data2.length > 0) console.log('Detected columns (fallback):', Object.keys(data2[0]).join(', '));
    }
    process.exit(1);
  }

  printResults(data || [], 'candidatos_prefeito_ba_2024');
}

function printResults(rows, source) {
  console.log(`Results from table: ${source}`);
  if (!rows || rows.length === 0) {
    console.log('No candidatos found for this municipio.');
    return;
  }
  const totalVotos = rows.reduce((s, r) => s + (r.votos || 0), 0);
  const withMeta = rows.map((r, i) => ({
    id: r.id,
    nome: r.nome || r.nome_candidato || r.candidato || '—',
    partido: r.partido || r.sigla_partido || '—',
    votos: r.votos || 0,
    posicao: i + 1,
    porcentagem: totalVotos > 0 ? ((r.votos || 0) / totalVotos) * 100 : 0
  }));

  console.table(withMeta.map(r => ({
    id: r.id,
    nome: r.nome,
    partido: r.partido,
    votos: r.votos,
    posicao: r.posicao,
    porcentagem: r.porcentagem.toFixed(2) + '%'
  })));
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
