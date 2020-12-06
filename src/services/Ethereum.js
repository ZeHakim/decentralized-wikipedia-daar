import Web3 from 'web3'
import ContractInterface from '../build/contracts/Wikipedia.json'
import { connectEthereum, getAllArticles, historical } from '../store/reducers/root'
import store from '../store'
import Fortmatic from 'fortmatic'

const connect = async dispatch => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    try {
      const [account] = await window.ethereum.enable()
      const contract = new window.web3.eth.Contract(
        ContractInterface.abi,
        ContractInterface.networks['5777'].address,
        { from: account }
      )
      dispatch(connectEthereum({ account, contract }))
    } catch (error) {
      console.error(error)
    }
  } else {
    // Partie qui gere l'integration de Fortmatic
    const customNodeOptions = {
      rpcUrl: 'http://127.0.0.1:7545', // your own node url
      chainId: 1337 // chainId of your own node
      }
      const fm = new Fortmatic('pk_test_7DBA38B8B256024A', customNodeOptions);
      window.web3 = new Web3(fm.getProvider());
      try {
        const [account]= await window.web3.eth.getAccounts(); //Fortmatic
        const contract = new window.web3.eth.Contract(
          ContractInterface.abi,
          ContractInterface.networks['5777'].address,
          { from: account }
        )
        dispatch(connectEthereum({ account, contract }))
      } catch (error) {
        console.error(error)
      }
      // console.log('Not Dapp browser.')
    }
}

// implimentaion des services de façon plus propre 
// PAS ENCORE OPP

const addArticle = (content) => async dispatch => {
  console.log("dans sevice");
  const { contract } = store.getState();
  try {
    await contract.methods.createArticle(content).send({ from: contract.account });
  } catch (error) {
    console.error(error)
  }
  // Mise à jour des articles dans l'application
  var articles = getArticles(contract);
  dispatch(getAllArticles({articles}));

  // Mise à jour de l'historique de l'application
  var allHistorical = getAllHistory(articles,contract);
  dispatch(historical({allHistorical}));
}

const updateArticle = (id,content) => async dispatch => {
  console.log("dans sevice");
  const { contract } = store.getState();
  await contract.methods.updateArticle(id,content).send({ from: contract.account });
  // Mise à jour des articles dans l'application
  var articles = getArticles(contract);
  dispatch(getAllArticles({articles}));

  // Mise à jour de l'historique de l'application
  var allHistorical = getAllHistory(articles,contract);
  dispatch(historical({allHistorical}));
}
const loadAllArticles = async dispatch => {

  const { contract } = store.getState();

  // Mise à jour des articles dans l'application
  var articles = getArticles(contract);
  dispatch(getAllArticles({articles}));

  // Mise à jour de l'historique de l'application
  var allHistorical = getAllHistory(articles,contract);
  dispatch(historical({allHistorical}));
}

  //fonction pour qui recupere tous les articles
  async function getArticles (contract) {
    var recevedArticles = [];
    var res = [];

    recevedArticles = await contract.methods.getAllIds().call();

    for (var i = 0; i < recevedArticles.length; i++) {
      const article = await contract.methods.articleContent(recevedArticles[i]).call();
      res.push(article);
    }

    return res;
  }

  async function getAllHistory (articles,contract) {

    var myMap = new Map();

    for (var i = 0; i < articles.length; i++) {
      myMap.set(i,getHistory(i,contract));
    }
    return myMap;
  }

  async function getHistory (id, contract) {
    var countofHistory = [];
    var historyRes = [];
    countofHistory = await contract.methods.getHistoricalCount(id).call();
  
    for (var j = 0; j < countofHistory; j++) {
      const history = await contract.methods.getHistorical(id, j).call();
      historyRes.push(history);
    }
    return historyRes;
  }

export {connect, addArticle}
