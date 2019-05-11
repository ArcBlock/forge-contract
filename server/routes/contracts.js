const mcrypto = require('@arcblock/mcrypto');
const did = require('@arcblock/did');
const { Contract } = require('../models');

const types = mcrypto.types;

const sha3 = mcrypto.getHasher(mcrypto.types.HashType.SHA3);

function gen_contract_did(requester, content_hash, signatures) {
  const info = JSON.stringify(signatures.map(sig => ({ name: sig.name, email: sig.email })));
  const hash = content_hash.replace('0x', '').toLowerCase();
  const data = sha3(`${requester}${hash}${info}`);
  const did_type = {
    role: types.RoleType.ROLE_ASSET, // temp type
    pk: types.KeyType.ED25519,
    hash: types.HashType.SHA3,
  };
  return did.fromPublicKey(data, did_type);
}

module.exports = {
  init(app) {
    app.put('/api/contracts', async (req, res) => {
      // we need a better auth module, for api it shall use the tokens taken from the http header (Authorization: bearer <token>)

      // user = req.session.user;
      // if (!user || !user.did) return res.status(403);

      // need some basic param verification

      params = req.body;
      // in the form when it post the content it shall use Buffer.from(content).toString('base64'). This will
      // work for both text and later on pdf.
      const content_bin = Buffer.from(params.content, 'base64');
      console.log(content_bin);
      const hash = sha3(content_bin);
      const content_did = gen_contract_did(params.requester, hash, params.signatures);

      const c = await Contract.find({ did: content_did });

      if (c) {
        return res.status(422).json({});
      }

      console.log(hash);
      const now = new Date();
      const attrs = {
        did: content_did,
        // requester: req.session.user.did,
        requester: 'did:abt:z1SoDc2qx1orSYFu3muXJfRdddsLHBT1SS3', // just to make my test easy
        synopsis: params.synopsis,
        content: content_bin,
        hash,
        signatures: params.signatures,
        createdAt: now,
        updatedAt: now,
      };
      const contract = new Contract(attrs);

      await contract.save();
      res.json(attrs);
    });

    app.get('/api/contracts', async (req, res) => {
      console.log(req.session.user);
      const contracts = await Contract.find({ 'signatures.email': req.session.user.email });
      res.json(contracts ? contracts.map(c => c.toObject()) : []);
    });
  },
};
