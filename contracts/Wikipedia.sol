pragma solidity ^0.5.0;

contract Wikipedia {
  struct Article {
    string content;
  }

  uint[] public ids;
  mapping (uint => Article) public articlesById;

  constructor() public {
    uint index = 0;
    ids.push(index);
    Article memory newArticle = Article("This is your first article in your contract");
    articlesById[index] = newArticle;
  }

  function articleContent(uint index) public view returns (string memory) {
    return articlesById[index].content;
  }

  function getAllIds() public view returns (uint[] memory) {
    return ids;
  }

  
  function createArticle(string memory _content) public {
    uint index = ids[ids.length - 1] + 1;
    ids.push(index);
    Article memory newArticle = Article(_content);
    articlesById[index] = newArticle;
  }

  function updateArticle(uint _id, string memory _content) public {
    articlesById[ids[_id]].content = _content;
  }

  // Write your code here.
}
