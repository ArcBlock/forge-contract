const Mcrypto = require('@arcblock/mcrypto');
const MongoAuthStorage = require('@arcblock/did-auth-storage-mongo');
const GraphQLClient = require('@arcblock/graphql-client');
const { fromSecretKey, WalletType } = require('@arcblock/forge-wallet');
const { WalletAuthenticator, WalletHandlers } = require('@arcblock/did-auth');

const type = WalletType({
  role: Mcrypto.types.RoleType.ROLE_APPLICATION,
  pk: Mcrypto.types.KeyType.ED25519,
  hash: Mcrypto.types.HashType.SHA3,
});

const wallet = fromSecretKey(process.env.APP_SK, type).toJSON();
const chainHost = process.env.CHAIN_HOST;
const chainId = process.env.CHAIN_ID;
const client = new GraphQLClient({ endpoint: chainHost, chainId });

const authenticator = new WalletAuthenticator({
  client,
  wallet,
  baseUrl: process.env.BASE_URL,
  appInfo: {
    copyright: 'https://www.arcblock.io',
    name: 'Block Contract',
    description: 'Multi-party contract signing application built on forge',
    icon: 'https://arcblock.oss-cn-beijing.aliyuncs.com/images/256x256.png',
  },
  chainInfo: {
    host: chainHost,
    id: chainId,
  },
});

const handlers = new WalletHandlers({
  authenticator,
  tokenGenerator: () => Date.now().toString(),
  tokenStorage: new MongoAuthStorage({ url: process.env.MONGO_URI }),
});

module.exports = {
  authenticator,
  handlers,
  client,
  wallet,
};
