import { randomUUID } from 'node:crypto';

export class GeradorUuid {
  proximo() {
    return randomUUID();
  }
}
