import { GraphQLError } from "graphql";
import type { User } from ".";

export function requireUser(user: User | null): User {
  if(user == null){
    throw new GraphQLError('You must be authenticated to perform this request', {
      extensions: {
        code: 'FORBIDDEN'
      }
    })
  }
  return user
}