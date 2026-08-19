// Only the fields used by the interface are typed to simplify maintenance.
// The keys remain in snake_case to adhere to the GitHub API contract without unnecessary mapping

export interface GithubUser {
  // Native GitHub ID or a unique identifier generated on the client side
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

// Response from the GET /search/users endpoint
export interface GithubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubUser[];
}
