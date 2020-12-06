export const UPDATE_USER = 'UPDATE_USER'
export const CONNECT_ETHEREUM = 'CONNECT_ETHEREUM'
export const ARTICLES = 'ARTICLES'
export const HISTORICAL = 'HISTORICAL'

const initialState = {
  user: null,
  account: null,
  contract: null,
  articles : [],
  historical : [new Map()],
}

const updateUser = user => ({ type: UPDATE_USER, user })

const connectEthereum = ({ account, contract }) => ({
  type: CONNECT_ETHEREUM,
  account,
  contract,
})

const getAllArticles = ({articles}) => ({
  type: ARTICLES,
  articles,
})

const historical = ({historical}) => ({
  type: HISTORICAL,
  historical,
})

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_USER:
      const { user } = action
      return { ...state, user }
    case CONNECT_ETHEREUM:
      const { account, contract } = action
      return { ...state, account, contract }
    case ARTICLES:
      const {allarticles} = action
      return { ...state, allarticles}
    case HISTORICAL:
      const {historical} = action
      return {...state, historical}
    default:
      return state
  }
}

export default rootReducer
export { updateUser, connectEthereum, getAllArticles, historical }
