import { MockList } from 'graphql-tools';
import casual from 'casual';

export default {
  Query: () => ({
    cities: () => new MockList(5, () => ({
      id: () => casual.integer(1, 10000),
      name: () => casual.random_element(['Nashville', 'Chattanooga', 'Atlanta', 'Knoxville', 'Asheville', 'Charlotte', 'Boulder', 'Denver']),
      population: () => casual.integer(100000, 5000000),
      state: () => ({
        id: casual.integer(1, 10000),
        name: casual.state_abbr,
      }),
    })),
  }),
};
