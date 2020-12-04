import { useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Link, Route } from 'react-router-dom'
import * as Ethereum from './services/Ethereum'
import styles from './App.module.css'
import MediumEditor from 'medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/default.css'
import "bootstrap/dist/css/bootstrap.min.css";

import { Jumbotron, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Input,NavItem, NavLink} from 'reactstrap';

const NewArticle = () => {
  const [editor, setEditor] = useState(null)
  const contract = useSelector(({ contract }) => contract)

  useEffect(() => {
    setEditor(new MediumEditor(`.${styles.editable}`))
  }, [setEditor])

  const onSubmit = async (evt) => {

    var content = document.getElementsByClassName(styles.editable)[0].firstElementChild.innerHTML;
    console.log(content);
    // Ethereum.addArticle(content, contract);

    try {
      await contract.methods.createArticle(content).send({ from: contract.account });
    } catch (error) {
      console.error("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEe"+error)
    }

    // contract.methods.getAllIds().call().then(console.log)

  }

  return (
    <form onSubmit={onSubmit}>
      <div className={styles.subTitle}>New article</div>
      <div className={styles.mediumWrapper}>
        <textarea className={styles.editable}/>
      </div>
      <input type="submit" value="Submit" />
    </form>
  )
}

const Home = () => {
  return (
    <div className={styles.links}>
      <Link to="/">Home</Link>
      <Link to="/article/new">Add an article</Link>
      <Link to="/article/all">All articles</Link>
    </div>
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

  const toggle = (e) => {
    setModal(!modal);
    // console.log(e.target.name);
    // console.log(articles[e.target.name]);
    if (e.target.id="Editer"){
      setIdArticle(e.target.name)
      setUpdateArticle(articles[e.target.name]);
    }
  }

  const toggleHistory = (e) => {
    setModalHistory(!modalHistory);
    if (!modalHistory){
      setIdHistory(parseInt(e.target.name, 10));
    }
  }
  const updateArtcile = async(evt) =>{
    evt.preventDefault();
    console.log("update article ----------->")
    console.log(updateArticle);
    console.log("id artcile "+idArticle);

    try {
      await contract.methods.updateArticle(idArticle,updateArticle).send({ from: contract.account });
      articles[idArticle] = updateArticle;

      setModal(!modal);
    } catch (error) {
      console.error(error)
    }
  }

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

  const loadArticles = async() =>{

    // var re = await Ethereum.loadArticles(contract);
    // var resArticle = [];
    // for (let [key, value] of re[0]) {
    //   resArticle.push(value);
    // }
    // setArticles(articles.concat(resArticle));
    // for (let [key, value] of re[1]) {
    //   console.log(value.length);
    //   setMyMap(myMap.set(parseInt(key,10),[value]));
    // }
    

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

    for (let [key, value] of myMap) {
      value.map(x =>{
        console.log("---g>"+x)
      })
      console.log(key + " = " + value);
      }
  }

  const historyOfArtivle = async (evt) => {
    setModalHistory(!modalHistory);
    var countofHistory = [];
    var res = [];
    countofHistory = await contract.methods.getHistoricalCount(evt.target.name).call();
    
    for (var i = 0; i <= countofHistory; i++) {
      console.log("parcours iiiiiiii "+i);
      const history = await contract.methods.getHistorical(evt.target.name, i).call();
      console.log("history "+history);
      res.push(history);
    }
    setArticleHistory(articleHistory.concat(res));

  }

  const onTodoChange = (evt) =>{
    const txt = evt.target.value;

    setUpdateArticle(txt);
    setIdArticle(evt.target.name);

    console.log(updateArticle);
  }

  useEffect(() => {
    if (contract) {
      loadArticles();
    }
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
