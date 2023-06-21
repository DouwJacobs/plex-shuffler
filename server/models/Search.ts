import type Media from '@server/entity/Media';

export type MediaType = 'tv' | 'playlist';

interface SearchResult {
  id: number;
  mediaType: MediaType;
  popularity: number;
  posterPath?: string;
  backdropPath?: string;
  voteCount: number;
  voteAverage: number;
  genreIds: number[];
  overview: string;
  originalLanguage: string;
  mediaInfo?: Media;
}

export interface TvResult extends SearchResult {
  mediaType: 'tv';
  name: string;
  originalName: string;
  originCountry: string[];
  firstAirDate: string;
}

export interface PlaylistResult {
  ratingKey: number;
  id: number;
  key: string;
  guid: string;
  type: string;
  title: string;
  summary: string;
  smart: boolean;
  composite: string;
  viewCount: number;
  lastViewedAt: number;
  thumb: string;
  duration: number;
  leafCount: number;
  addedAt: number;
  updatedAt: number;
  mediaType: 'playlist';
}

export interface ShowResult {
  ratingKey: string;
  title: string;
  mediaType: 'tv';
  thumb: string;
  summary: string;
}
