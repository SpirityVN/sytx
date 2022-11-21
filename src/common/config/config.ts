import type { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: process.env.NODE_ENV !== 'production' ? true : false,
    title: 'Welcome to the Spritiy.JSC',
    description: 'SyTX API description',
    version: '0.1',
    path: 'api',
  },
  security: {
    expiresIn: '7d',
    bcryptSaltOrRound: 10,
    expiresInEmail: '5m',
  },
};

export default (): Config => config;
