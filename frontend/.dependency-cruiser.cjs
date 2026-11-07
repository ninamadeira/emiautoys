/** Regra da dependência da Arquitetura Hexagonal no front-end (Artigo XII). */
module.exports = {
  forbidden: [
    {
      name: 'aplicacao-sem-framework',
      comment: 'application não importa Angular, RxJS nem nada fora de si mesma',
      severity: 'error',
      from: { path: '^src/app/application' },
      to: { pathNot: '^src/app/application', dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'casos-de-uso-apenas-dominio-e-portas',
      severity: 'error',
      from: { path: '^src/app/application/use-cases' },
      to: { pathNot: '^src/app/application/(domain|ports|use-cases)' },
    },
    {
      name: 'aplicacao-nunca-importa-adaptadores-nem-configuracao',
      severity: 'error',
      from: { path: '^src/app/application' },
      to: { path: '^src/app/(adapters|config)' },
    },
    {
      name: 'adaptadores-de-entrada-nao-importam-os-de-saida',
      severity: 'error',
      from: { path: '^src/app/adapters/in' },
      to: { path: '^src/app/(adapters/out|config)' },
    },
    {
      name: 'adaptadores-de-saida-nao-importam-os-de-entrada',
      severity: 'error',
      from: { path: '^src/app/adapters/out' },
      to: { path: '^src/app/(adapters/in|config)' },
    },
  ],
  options: { doNotFollow: { path: 'node_modules' }, tsPreCompilationDeps: true },
};
