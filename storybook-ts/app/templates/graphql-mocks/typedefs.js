export default `

type Query {
  cities: [City!]!
}

type City {
  id: ID!
  name: String!
  population: Int!
  state: State!
}

type State {
  id: ID!
  name: String!
}

`;
