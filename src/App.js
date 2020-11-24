import { useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Link, Route } from 'react-router-dom'
import * as Ethereum from './services/Ethereum'
import styles from './App.module.css'
import MediumEditor from 'medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/default.css'
import "bootstrap/dist/css/bootstrap.min.css";

import { Jumbotron, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Input,Form, FormGroup} from 'reactstrap';

const NewArticle = () => {
  const [editor, setEditor] = useState(null)
  const contract = useSelector(({ contract }) => contract)

  useEffect(() => {
    setEditor(new MediumEditor(`.${styles.editable}`))
  }, [setEditor])

  const onSubmit = async (evt) => {
    evt.preventDefault();
    var content = document.getElementsByClassName(styles.editable)[0].firstElementChild.innerHTML;

    try {
      await contract.methods.createArticle(content).send({ from: contract.account });
    } catch (error) {
      console.error(error)
    }



    contract.methods.getAllIds().call().then(console.log)

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

  const contract = useSelector(({ contract }) => contract)

  const toggle = () => setModal(!modal);

  
  const updateArtcile = async(evt) =>{
    evt.preventDefault();
    console.log("update article ----------->")
    console.log(updateArticle);
    console.log("id artcile "+idArticle);

    try {
      await contract.methods.updateArticle(idArticle,updateArticle).send({ from: contract.account });
    } catch (error) {
      console.error(error)
    }
  }

  const loadArticles = async() =>{
    var recevedArticles = [];
    var res = [];
    recevedArticles = await contract.methods.getAllIds().call();
    for (var i = 0; i < recevedArticles.length; i++) {
      const article = await contract.methods.articleContent(recevedArticles[i]).call();
      res.push(article);
    }
    setArticles(articles.concat(res));
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
    // console.log("gggggggggggggggg");
    // console.log(articles.length);
    // articles.map(x => console.log(x));
  }, [contract, setArticles])
  return <div>{articles.map((article, index) => <div> 
                                                  <Jumbotron id={index}> 
                                                    <h5 className="display-6">Article {index}</h5>
                                                    <hr className="my-2" />
                                                    <p>{article}</p>  
                                                    <p className="lead"></p>
                                                      <Input type="textarea" placeholder={article} name={index} className={styles.editable} onChange={onTodoChange}/>
                                                      <Button color="danger"  onClick={updateArtcile}>
                                                        Save
                                                      </Button>                                                 

                                                    {/* <Button hidden={modal} variant="primary" onClick={toggle}>
                                                      Editer
                                                    </Button>   
                                                    
                                                    <Modal isOpen={modal} toggle={toggle} className=''>
                                                      <ModalHeader toggle={toggle}>Modification article {index}</ModalHeader>
                                                      <ModalBody>
                                                      <Input type="textarea" placeholder={article} name={index} className={styles.editable} onChange={onTodoChange}/>
                                                      </ModalBody>
                                                      <ModalFooter>
                                                        <Button color="primary" onClick={toggle, updateArtcile}>Enregister</Button>{' '}
                                                        <Button color="secondary" onClick={toggle}>Cancel</Button>
                                                      </ModalFooter>
                                                    </Modal> */}

                                                  </Jumbotron>
                                                 
                                                  

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
