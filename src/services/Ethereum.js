import Web3 from 'web3'
import ContractInterface from '../build/contracts/Wikipedia.json'
import { connectEthereum } from '../store/reducers/root'

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

const addArticle  = async (content, contract) => {
  console.log("dans sevice");
  try {
    await contract.methods.createArticle(content).send({ from: contract.account });
  } catch (error) {
    console.error(error)
  }
}


async function loadArticles (contract) {
  var recevedArticles = [];
  var articlesListe = [];

  var articlesHistoty = new Map();
  var articles = new Map();

  recevedArticles = await contract.methods.getAllIds().call();

  for (var i = 0; i < recevedArticles.length; i++) {
    const article = await contract.methods.articleContent(recevedArticles[i]).call();
    articlesListe.push(article);
    articles.set(recevedArticles[i], article);

    var historyRes = [];
    var countofHistory = await contract.methods.getHistoricalCount(i).call();
  
    for (var j = 0; j < countofHistory; j++) {
      const history = await contract.methods.getHistorical(i, j).call();
      historyRes.push(history);
    }
    articlesHistoty.set(recevedArticles[i], historyRes);
  }
  return [articles, articlesHistoty];
}

export {connect, loadArticles}
