export interface GithubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GithubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubUser[];
}
