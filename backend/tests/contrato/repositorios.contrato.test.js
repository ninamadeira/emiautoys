import { RepositorioCarrinhoEmMemoria } from '../../src/adapters/out/memoria/repositorio-carrinho-em-memoria.js';
import { RepositorioCupomEmMemoria } from '../../src/adapters/out/memoria/repositorio-cupom-em-memoria.js';
import { RepositorioPedidoEmMemoria } from '../../src/adapters/out/memoria/repositorio-pedido-em-memoria.js';
import { RepositorioProdutoEmMemoria } from '../../src/adapters/out/memoria/repositorio-produto-em-memoria.js';
import { RepositorioUsuarioEmMemoria } from '../../src/adapters/out/memoria/repositorio-usuario-em-memoria.js';
import { RepositorioCarrinhoSqlite } from '../../src/adapters/out/sqlite/repositorio-carrinho-sqlite.js';
import { RepositorioCupomSqlite } from '../../src/adapters/out/sqlite/repositorio-cupom-sqlite.js';
import { RepositorioPedidoSqlite } from '../../src/adapters/out/sqlite/repositorio-pedido-sqlite.js';
import { RepositorioProdutoSqlite } from '../../src/adapters/out/sqlite/repositorio-produto-sqlite.js';
import { RepositorioUsuarioSqlite } from '../../src/adapters/out/sqlite/repositorio-usuario-sqlite.js';
import { abrirBanco } from '../../src/config/banco.js';
import {
  executarContratoRepositorioCarrinho,
  executarContratoRepositorioCupom,
  executarContratoRepositorioPedido,
  executarContratoRepositorioProduto,
  executarContratoRepositorioUsuario,
} from './contratos-repositorios.js';

const bancoEmMemoria = () => abrirBanco({ nomeArquivo: ':memory:' });

executarContratoRepositorioProduto('in memory', async () => new RepositorioProdutoEmMemoria());
executarContratoRepositorioProduto('sqlite', async () => new RepositorioProdutoSqlite(bancoEmMemoria()));

executarContratoRepositorioUsuario('in memory', async () => new RepositorioUsuarioEmMemoria());
executarContratoRepositorioUsuario('sqlite', async () => new RepositorioUsuarioSqlite(bancoEmMemoria()));

executarContratoRepositorioCarrinho('in memory', async () => new RepositorioCarrinhoEmMemoria());
executarContratoRepositorioCarrinho('sqlite', async () => new RepositorioCarrinhoSqlite(bancoEmMemoria()));

executarContratoRepositorioCupom('in memory', async () => new RepositorioCupomEmMemoria());
executarContratoRepositorioCupom('sqlite', async () => new RepositorioCupomSqlite(bancoEmMemoria()));

executarContratoRepositorioPedido('in memory', async () => new RepositorioPedidoEmMemoria());
executarContratoRepositorioPedido('sqlite', async () => new RepositorioPedidoSqlite(bancoEmMemoria()));
