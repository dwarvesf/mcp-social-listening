/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from 'dotenv';

dotenv.config();

import Vault from 'node-vault';

class VaultUtils {
  vaultClient: any;

  constructor() {
    this.vaultClient = this._initVaultClient();
  }

  _initVaultClient() {
    const vaultToken = process.env.VAULT_TOKEN;
    const vaultUrl = process.env.VAULT_ADDR;

    if (!vaultToken || !vaultUrl) {
      throw new Error(
        'Vault token or Vault address is not set in environment variables',
      );
    }
    return Vault({
      apiVersion: 'v1',
      endpoint: vaultUrl,
      token: vaultToken,
    });
  }

  async getSecretValue(key: string) {
    const vaultPath = process.env.VAULT_PATH;

    if (!vaultPath) {
      throw new Error('VAULT_PATH environment variable is not set');
    }

    try {
      const secret = await this.vaultClient.read(vaultPath);
      return secret.data.data[key];
    } catch (error: any) {
      console.error(
        `Failed to read Vault secret at path ${vaultPath}: ${error?.message}`,
      );
      throw error;
    }
  }
}

const vaultUtils = new VaultUtils();

export { vaultUtils };
