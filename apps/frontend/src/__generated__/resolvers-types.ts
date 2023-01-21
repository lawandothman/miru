import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Genre = {
  __typename?: 'Genre';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Movie = {
  __typename?: 'Movie';
  adult?: Maybe<Scalars['Boolean']>;
  backdropUrl?: Maybe<Scalars['String']>;
  budget?: Maybe<Scalars['Int']>;
  buyProviders?: Maybe<Array<Maybe<WatchProvider>>>;
  genres?: Maybe<Array<Maybe<Genre>>>;
  homepage?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  imdbId?: Maybe<Scalars['String']>;
  inWatchlist?: Maybe<Scalars['Boolean']>;
  matches?: Maybe<Array<Maybe<User>>>;
  originalTitle?: Maybe<Scalars['String']>;
  overview?: Maybe<Scalars['String']>;
  popularity?: Maybe<Scalars['Float']>;
  posterUrl?: Maybe<Scalars['String']>;
  releaseDate?: Maybe<Scalars['String']>;
  rentProviders?: Maybe<Array<Maybe<WatchProvider>>>;
  revenue?: Maybe<Scalars['Int']>;
  runtime?: Maybe<Scalars['Int']>;
  streamProviders?: Maybe<Array<Maybe<WatchProvider>>>;
  tagline?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  tmdbVoteAverage?: Maybe<Scalars['Float']>;
  tmdbVoteCount?: Maybe<Scalars['Int']>;
  trailer?: Maybe<Trailer>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addMovieToWatchlist?: Maybe<Movie>;
  follow?: Maybe<User>;
  removeMovieFromWatchlist?: Maybe<Movie>;
  unfollow?: Maybe<User>;
};


export type MutationAddMovieToWatchlistArgs = {
  movieId: Scalars['ID'];
};


export type MutationFollowArgs = {
  friendId: Scalars['ID'];
};


export type MutationRemoveMovieFromWatchlistArgs = {
  movieId: Scalars['ID'];
};


export type MutationUnfollowArgs = {
  friendId: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  bots?: Maybe<Array<Maybe<User>>>;
  genre?: Maybe<Genre>;
  genres?: Maybe<Array<Maybe<Genre>>>;
  movie?: Maybe<Movie>;
  moviesByGenre?: Maybe<Array<Maybe<Movie>>>;
  moviesForYou?: Maybe<Array<Maybe<Movie>>>;
  popularMovies?: Maybe<Array<Maybe<Movie>>>;
  search?: Maybe<Array<Maybe<Movie>>>;
  searchUsers?: Maybe<Array<Maybe<User>>>;
  user?: Maybe<User>;
  watchlist?: Maybe<Array<Maybe<Movie>>>;
};


export type QueryGenreArgs = {
  genreId: Scalars['ID'];
};


export type QueryMovieArgs = {
  id: Scalars['ID'];
};


export type QueryMoviesByGenreArgs = {
  genreId: Scalars['ID'];
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type QueryMoviesForYouArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type QueryPopularMoviesArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type QuerySearchArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  query: Scalars['String'];
};


export type QuerySearchUsersArgs = {
  nameQuery: Scalars['String'];
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QueryWatchlistArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

export type Trailer = {
  __typename?: 'Trailer';
  key?: Maybe<Scalars['String']>;
  provider?: Maybe<VideoProvider>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  followers?: Maybe<Array<Maybe<User>>>;
  following?: Maybe<Array<Maybe<User>>>;
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  isBot: Scalars['Boolean'];
  isFollower?: Maybe<Scalars['Boolean']>;
  isFollowing?: Maybe<Scalars['Boolean']>;
  matches?: Maybe<Array<Maybe<Movie>>>;
  name: Scalars['String'];
  watchlist?: Maybe<Array<Maybe<Movie>>>;
};

export enum VideoProvider {
  YouTube = 'YouTube'
}

export type WatchProvider = {
  __typename?: 'WatchProvider';
  displayPriority?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  logoPath?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Genre: ResolverTypeWrapper<Genre>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Movie: ResolverTypeWrapper<Movie>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Trailer: ResolverTypeWrapper<Trailer>;
  User: ResolverTypeWrapper<User>;
  VideoProvider: VideoProvider;
  WatchProvider: ResolverTypeWrapper<WatchProvider>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean'];
  Float: Scalars['Float'];
  Genre: Genre;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Movie: Movie;
  Mutation: {};
  Query: {};
  String: Scalars['String'];
  Trailer: Trailer;
  User: User;
  WatchProvider: WatchProvider;
}>;

export type GenreResolvers<ContextType = any, ParentType extends ResolversParentTypes['Genre'] = ResolversParentTypes['Genre']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MovieResolvers<ContextType = any, ParentType extends ResolversParentTypes['Movie'] = ResolversParentTypes['Movie']> = ResolversObject<{
  adult?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  backdropUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  budget?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  buyProviders?: Resolver<Maybe<Array<Maybe<ResolversTypes['WatchProvider']>>>, ParentType, ContextType>;
  genres?: Resolver<Maybe<Array<Maybe<ResolversTypes['Genre']>>>, ParentType, ContextType>;
  homepage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imdbId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  inWatchlist?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  matches?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  originalTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  overview?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  popularity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  posterUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  releaseDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rentProviders?: Resolver<Maybe<Array<Maybe<ResolversTypes['WatchProvider']>>>, ParentType, ContextType>;
  revenue?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  runtime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  streamProviders?: Resolver<Maybe<Array<Maybe<ResolversTypes['WatchProvider']>>>, ParentType, ContextType>;
  tagline?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tmdbVoteAverage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  tmdbVoteCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  trailer?: Resolver<Maybe<ResolversTypes['Trailer']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addMovieToWatchlist?: Resolver<Maybe<ResolversTypes['Movie']>, ParentType, ContextType, RequireFields<MutationAddMovieToWatchlistArgs, 'movieId'>>;
  follow?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationFollowArgs, 'friendId'>>;
  removeMovieFromWatchlist?: Resolver<Maybe<ResolversTypes['Movie']>, ParentType, ContextType, RequireFields<MutationRemoveMovieFromWatchlistArgs, 'movieId'>>;
  unfollow?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUnfollowArgs, 'friendId'>>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  bots?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  genre?: Resolver<Maybe<ResolversTypes['Genre']>, ParentType, ContextType, RequireFields<QueryGenreArgs, 'genreId'>>;
  genres?: Resolver<Maybe<Array<Maybe<ResolversTypes['Genre']>>>, ParentType, ContextType>;
  movie?: Resolver<Maybe<ResolversTypes['Movie']>, ParentType, ContextType, RequireFields<QueryMovieArgs, 'id'>>;
  moviesByGenre?: Resolver<Maybe<Array<Maybe<ResolversTypes['Movie']>>>, ParentType, ContextType, RequireFields<QueryMoviesByGenreArgs, 'genreId'>>;
  moviesForYou?: Resolver<Maybe<Array<Maybe<ResolversTypes['Movie']>>>, ParentType, ContextType, Partial<QueryMoviesForYouArgs>>;
  popularMovies?: Resolver<Maybe<Array<Maybe<ResolversTypes['Movie']>>>, ParentType, ContextType, Partial<QueryPopularMoviesArgs>>;
  search?: Resolver<Maybe<Array<Maybe<ResolversTypes['Movie']>>>, ParentType, ContextType, RequireFields<QuerySearchArgs, 'query'>>;
  searchUsers?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, RequireFields<QuerySearchUsersArgs, 'nameQuery'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  watchlist?: Resolver<Maybe<Array<Maybe<ResolversTypes['Movie']>>>, ParentType, ContextType, Partial<QueryWatchlistArgs>>;
}>;

export type TrailerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Trailer'] = ResolversParentTypes['Trailer']> = ResolversObject<{
  key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  provider?: Resolver<Maybe<ResolversTypes['VideoProvider']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  followers?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  following?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isBot?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isFollower?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isFollowing?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  matches?: Resolver<Maybe<Array<Maybe<ResolversTypes['Movie']>>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  watchlist?: Resolver<Maybe<Array<Maybe<ResolversTypes['Movie']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WatchProviderResolvers<ContextType = any, ParentType extends ResolversParentTypes['WatchProvider'] = ResolversParentTypes['WatchProvider']> = ResolversObject<{
  displayPriority?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logoPath?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Genre?: GenreResolvers<ContextType>;
  Movie?: MovieResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Trailer?: TrailerResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  WatchProvider?: WatchProviderResolvers<ContextType>;
}>;

