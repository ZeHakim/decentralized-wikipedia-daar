import Web3 from 'web3'
import ContractInterface from '../build/contracts/Wikipedia.json'
import { connectEthereum, getAllArticles, historical } from '../store/reducers/root'
import store from '../store'

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
    console.log('Not Dapp browser.')
  }
}

// implimentaion des services de façon plus propre 
// PAS ENCORE OPP
const addArticle  = async (content, contract) => {
  console.log("dans sevice");
  try {
    await contract.methods.createArticle(content).send({ from: contract.account });
  } catch (error) {
    console.error(error)
  }
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

export {connect, loadAllArticles}
