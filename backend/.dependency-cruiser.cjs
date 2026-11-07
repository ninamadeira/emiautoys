/** Regra da dependência da Arquitetura Hexagonal (Artigo XII). */
module.exports = {
  forbidden: [
    {
      name: 'dominio-isolado',
      comment: 'application/domain não importa nada de fora de si mesmo',
      severity: 'error',
      from: { path: '^src/application/domain' },
      to: { pathNot: '^src/application/domain' },
    },
    {
      name: 'casos-de-uso-apenas-dominio-e-portas',
      severity: 'error',
      from: { path: '^src/application/use-cases' },
      to: { pathNot: '^src/application/(domain|ports|use-cases)' },
    },
    {
      name: 'aplicacao-nunca-importa-adaptadores-nem-configuracao',
      severity: 'error',
      from: { path: '^src/application' },
      to: { path: '^src/(adapters|config)' },
    },
    {
      name: 'adaptadores-de-entrada-nao-importam-os-de-saida',
      severity: 'error',
      from: { path: '^src/adapters/in' },
      to: { path: '^src/(adapters/out|config)' },
    },
    {
      name: 'adaptadores-de-saida-nao-importam-os-de-entrada',
      severity: 'error',
      from: { path: '^src/adapters/out' },
      to: { path: '^src/(adapters/in|config)' },
    },
  ],
  options: { doNotFollow: { path: 'node_modules' } },
};
