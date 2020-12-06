import { useEffect, useState, useGlobal} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Link, Route } from 'react-router-dom'
import * as Ethereum from './services/Ethereum'
import styles from './App.module.css'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/default.css'
import "bootstrap/dist/css/bootstrap.min.css";

import { Jumbotron, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Input  , NavLink} from 'reactstrap';

const NewArticle = () => {
  const [editor, setEditor] = useState(null)
  const contract = useSelector(({ contract }) => contract)

  // permet de faire appel au service d'ajout d'article
  const dispatch = useDispatch()
  const onSubmit = () => dispatch(Ethereum.addArticle(editor))
  
  // Permet de recuperer la valuer de l'input ajout artcile
  const inputArticle = (event) => {
    setEditor(event.target.value)
  }
  useEffect(() => { 
  }, [setEditor])

  // Version 0 d'ajout d'article 
  // const onSubmit = async (evt) => {

  //   var content = document.getElementsByClassName(styles.editable)[0].firstElementChild.innerHTML;

  //   var s = await contract.methods.createArticle(content).send({ from: contract.account });
  //   console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
  //   console.log(s)
  //   // try {
  //   //   await contract.methods.createArticle(content).send({ from: contract.account });
  //   // } catch (error) {
  //   //   console.error(error)
  //   // }
  // }

  return (
    <form onSubmit={onSubmit}>
      <div className={styles.subTitle}>New article</div>
      <div className={styles.mediumWrapper}>
        <Input onChange={inputArticle} />
      </div>
      <input type="submit" value="Ajouter" />
    </form>
  )
}

const Home = () => {
  return (
    <p>
      Welcome to the DAAR project. The idea will be to implement a 
      complete Wikipedia in a decentralized way, on Ethereum. 
      This will have cool side effects, like not be forced to pay for servers.
    </p>
  )
}


const AllArticles = () => {
  const [articles, setArticles] = useState([])
  const [modal, setModal] = useState(false);
  const [updateArticle, setUpdateArticle] = useState('');
  const [idArticle, setIdArticle] = useState(null);
  const [modalHistory, setModalHistory] = useState(false);
  const [articleHistory, setArticleHistory] = useState([]);
  const [myMap, setMyMap] = useState(new Map());
  const [idHistory, setIdHistory] = useState(0);

  const contract = useSelector(({ contract }) => contract)

  // Permet d'afficher et de cacher le modal de mise a jour d'un article
  const toggle = (e) => {
    setModal(!modal);
    if (e.target.id="Editer"){
      setIdArticle(parseInt(e.target.name, 10))
      setUpdateArticle(articles[e.target.name]);
    }
  }
  // Permet d'afficher et de cacher le modal de l'historique d'un article
  const toggleHistory = (e) => {
    setModalHistory(!modalHistory);
    if (!modalHistory){
      setIdHistory(parseInt(e.target.name, 10));
    }
  }

  // const dispatch = useDispatch()
  // const updateArtcile1 = () => dispatch(Ethereum.updateArticle(idArticle,updateArticle))

  // Peremt de mettre à jour un article
  const updateArtcile = async(evt) =>{
    evt.preventDefault();
    try {
      await contract.methods.updateArticle(idArticle,updateArticle).send({ from: contract.account });
      articles[idArticle] = updateArticle;
      setModal(!modal);
    } catch (error) {
      console.error(error)
    }
    getHistory(idArticle);
  }

  // Permet de recuperer l'historique d'un article
  const getHistory = async (id) =>{
    var countofHistory = [];
    var historyRes = [];
    countofHistory = await contract.methods.getHistoricalCount(id).call();
  
    for (var j = 0; j < countofHistory; j++) {
      const history = await contract.methods.getHistorical(id, j).call();
      historyRes.push(history);
    }
    setMyMap(myMap.set(id,historyRes));
  }

    // const allarticles = useSelector(({ articles }) => articles)
    // const history = useSelector(({ historical }) => historical)
    // console.log(allarticles);
    // console.log(history);
    // for (var i = 0; i < allarticles.length; i++) {
    //   console.log(allarticles[i]);
    // }

  // Permet de charger tous les articles et leur historique  
  const loadArticles = async() =>{
    var recevedArticles = [];
    var res = [];

    recevedArticles = await contract.methods.getAllIds().call();
    for (var i = 0; i < recevedArticles.length; i++) {
      const article = await contract.methods.articleContent(recevedArticles[i]).call();
      res.push(article);

      var countofHistory = [];
      var historyRes = [];
      countofHistory = await contract.methods.getHistoricalCount(i).call();
    
      for (var j = 0; j < countofHistory; j++) {
        const history = await contract.methods.getHistorical(i, j).call();
        historyRes.push(history);
      }
      setMyMap(myMap.set(i,historyRes));
    }
    setArticles(articles.concat(res));
  }

  // permet de recharger l'historique des article mais non utlisée
  const historyOfArticle = async (evt) => {
    setModalHistory(!modalHistory);
    var countofHistory = [];
    var res = [];
    countofHistory = await contract.methods.getHistoricalCount(evt.target.name).call();
    
    for (var i = 0; i <= countofHistory; i++) {
      const history = await contract.methods.getHistorical(evt.target.name, i).call();
      res.push(history);
    }
    setArticleHistory(articleHistory.concat(res));

  }

  // permet de recuperer le contenu du input lors de mise a jour
  const onTodoChange = (evt) =>{
    const txt = evt.target.value;
    setUpdateArticle(txt);
    setIdArticle(parseInt(evt.target.name, 10));
  }

  useEffect(() => {
    loadArticles();
  }, [contract, setArticles])
  return <div>{articles.map((article, index) => <div id={index} key={index+ "_artcileDiv"}> 
                                                  <Jumbotron key={index+ "_artcile"}> 
                                                    <h5 className="display-6">Article {index}</h5>
                                                    <hr className="my-2" />
                                                    <p>{article}</p>  
                                                    <p className="lead"></p>

                                                    <div className="nav">
                                                      <Button variant="primary" onClick={toggle} name={index} id="Editer">
                                                        Editer
                                                      </Button>   

                                                      <NavLink calss="my-2 my-lg-0" href="#" name={index}  onClick={toggleHistory}>Historique</NavLink>
                                                    </div>
                                                  </Jumbotron>
                                                  <Modal isOpen={modal} toggle={toggle} className=''>
                                                      <ModalHeader toggle={toggle}>Modification article {idArticle}</ModalHeader>
                                                      <ModalBody>
                                                      <Input type="textarea" value={updateArticle} name={idArticle} className={styles.editable} onChange={onTodoChange}/>
                                                      </ModalBody>
                                                    
                                                      <ModalFooter>
                                                        <Button color="primary" onClick={updateArtcile}>Enregister</Button>
                                                        <Button color="secondary" onClick={toggle}>Cancel</Button>
                                                      </ModalFooter>
                                                    </Modal>

                                                    <Modal isOpen={modalHistory} toggle={toggleHistory} className=''>
                                                      <ModalHeader toggle={toggleHistory}>Historique de l'aticle {idHistory}</ModalHeader>
                                                      <ModalBody>  
                                                                    
                                                        {myMap.get(idHistory).map(x => <p key={idHistory}_history> {myMap.get(idHistory).indexOf(x) > 0 && <hr className="my-2" />} {x} </p>)}
                                                      </ModalBody>
                                                    
                                                      <ModalFooter>
                                                        <Button color="secondary" onClick={toggleHistory}>Cancel</Button>
                                                      </ModalFooter>
                                                    </Modal>
                                                 
                                                  

                                                </div>)}</div>
}

const NotFound = () => {
  return <div>Not found</div>
}

const App = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(Ethereum.connect)
  }, [dispatch])
  return (
    <div className={styles.app}>
      <div className={styles.title}>      
        <Alert color="info">
          Welcome to Decentralized Wikipedia
        </Alert>
        <div className={styles.links}>
          <Link to="/">Home</Link>
          <Link to="/article/new">Add an article</Link>
          <Link to="/article/all">All articles</Link>
      </div>
      </div>
      <Switch>
        <Route path="/article/new">
          <NewArticle />
        </Route>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/article/all">
          <AllArticles />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </div>
  )
}

export default App
