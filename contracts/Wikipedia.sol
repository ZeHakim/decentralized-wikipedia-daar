pragma solidity ^0.5.0;

contract Wikipedia {
  struct Article {
    string content;
  }

  uint[] public ids;
  mapping (uint => Article) public articlesById;

  //Tableau permettant de récupérer le dernier identifiant de l'historique d'un article
  mapping (uint => uint) public idsOfHistory;

  //Tableau contenant l'historique de modification d'un artcile
  mapping (uint => mapping(uint => Article)) public historyOfArticles;

  constructor() public {
    uint index = 0;
    ids.push(index);
    Article memory newArticle = Article("This is your first article in your contract");
    articlesById[index] = newArticle;
  }

  // Fonction qui permet de recuperrer un article avec son id
  function articleContent(uint index) public view returns (string memory) {
    return articlesById[index].content;
  }

  // Fonction qui permet de récuperer la liste des ids
  function getAllIds() public view returns (uint[] memory) {
    return ids;
  }

  // Fonction qui permet la création d'article
  function createArticle(string memory _content) public {
    uint index = ids.length;
    ids.push(index);
    Article memory newArticle = Article(_content);
    articlesById[index] = newArticle;
    historyOfArticles[index][0] = newArticle;
    idsOfHistory[index] = 0;
  }


// Fonction qui permet la mise à d'un article
  function updateArticle(uint _id, string memory _content) public {
    uint id = idsOfHistory[_id];
    historyOfArticles[_id][id++] = articlesById[ids[_id]];
    articlesById[ids[_id]].content = _content;
    idsOfHistory[_id] = id;
  }

  // Fonction qui permet d'envoyer le nombre de fois q'un article a été met à jour
  function getHistoricalCount(uint _id) public view returns (uint){
    return idsOfHistory[_id];
  }

  // Fonction qui permet d'envoyer l'historique d'un article en fonction de l'id de la mise à jour
  function getHistorical(uint _idArticle, uint _idUpdate) public view returns (string memory){
    return historyOfArticles[_idArticle][_idUpdate].content;
  }

}
