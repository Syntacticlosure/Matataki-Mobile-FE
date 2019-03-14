import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs';
import * as config from '@/config';
import PriceFormatter from './priceFormatter';

ScatterJS.plugins(new ScatterEOS());

// const account = 'signature.bp';

// api https://get-scatter.com/docs/api-create-transaction

// @trick: use function to lazy eval Scatter eos, in order to avoid no ID problem.
const eos = () => ScatterJS.scatter.eos(config.network.eos, Eos, { expireInSeconds: 60 });
const currentEOSAccount = () => ScatterJS.scatter.identity && ScatterJS.scatter.identity.accounts.find(x => x.blockchain === 'eos');

const API = {
  async getBalancesByContract({ tokenContract = 'eosio.token', accountName, symbol }) {
    return eos().getCurrencyBalance(tokenContract, accountName, symbol);
  },
  install(Vue) {
    Object.defineProperties(Vue.prototype, {
      $API: {
        get() {
          return API;
        },
      },
    });
  },
  connectScatterAsync() {
    return ScatterJS.scatter.connect(config.appScatterName, { initTimeout: 2000 });
  },
  suggestNetworkAsync() {
    return ScatterJS.scatter.suggestNetwork(config.network.eos);
  },
  loginScatterAsync() {
    const requiredFields = { accounts: [config.network.eos] };
    return ScatterJS.scatter.getIdentity(requiredFields);
  },
  logoutScatterAsync() {
    return ScatterJS.scatter.forgetIdentity();
  },
  transferEOSAsync({
    to,
    memo = '',
    amount = 0,
  }) {
    return eos().transfer(
      currentEOSAccount().name,
      to,
      PriceFormatter.formatPrice(amount),
      memo, {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async transferTokenAsync({
    to,
    memo = '',
    amount = 0,
    tokenContract = 'eosio.token',
  }) {
    const contract = await eos().contract(tokenContract);

    return contract.transfer(
      currentEOSAccount().name,
      to,
      amount,
      memo, {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async withdraw() {
    if (currentEOSAccount() == null) { 
      alert('请先登录');
      return;
    }
    const contract = await eos().contract('signature.bp');
    await contract.claim(
      currentEOSAccount().name,
      {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async support({amount = null, hash = null, share_id = null,}) {
    if (currentEOSAccount() == null) { 
      alert('请先登录'); 
      return;
    }
    const contract = await eos().contract('signature.bp');
    const sign = await contract.getSignbyhash(hash);
    await contract.support({
      amount,
      sign_id: sign.id,
      share_id,
    });
  },
  async getPlayerIncome(name) {
    const { rows } = await eos().getTableRows({
      json: true,
      code: 'signature.bp',
      scope: name,
      table: 'players',
      limit: 10000,
    });
    return rows;
  },
  getPublicKey() {
    return ScatterJS.scatter.getPublicKey('eos').then(publicKey => {
      console.log(publicKey);
      return publicKey ;
    }).catch(error => {
      console.error('getPublicKey 失敗', error);
    });
  },
  getArbitrarySignatureAsync({publicKey, data}) {
    return ScatterJS.scatter.getArbitrarySignature({publicKey, data}).then(signature => {
      console.log({publicKey, data, signature});
      return signature ;
    }).catch(error => {
      console.error('getArbitrarySignature 失敗', error);
    });
  },
};


export default API;
export { eos, currentEOSAccount };
