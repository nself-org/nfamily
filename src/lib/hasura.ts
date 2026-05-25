/**
 * Purpose: Apollo Client factory for Hasura GraphQL connection.
 * Inputs:  serverUrl (string), authToken (string)
 * Outputs: ApolloClient instance configured for nSelf Hasura endpoint
 * Constraints: requires nSelf backend with nFamily plugin bundle active.
 *   Auth token injected via Authorization header. JWT expiry handled by caller.
 * SPORT: MASTER-LIBS.md
 */

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from '@apollo/client';

/**
 * Build an ApolloClient pointed at a given nSelf Hasura instance.
 * @param serverUrl - base URL of the nSelf backend (e.g. https://api.example.com)
 * @param authToken - JWT access token for Hasura auth
 */
export function createHasuraClient(
  serverUrl: string,
  authToken: string
): ApolloClient<unknown> {
  const httpLink = createHttpLink({
    uri: `${serverUrl}/v1/graphql`,
  });

  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return forward(operation);
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}
