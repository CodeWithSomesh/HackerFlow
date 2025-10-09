interface GitHubUser {
  login: string;
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  location: string;
  company: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  created_at: string;
  updated_at: string;
  topics: string[];
  private: boolean;
}

export class GitHubOAuthService {
  private static readonly GITHUB_API_BASE = 'https://api.github.com';

  static getAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('GitHub client ID not configured');
    }
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/api/auth/github/callback`,
      scope: 'read:user user:email public_repo',
      state: Math.random().toString(36).substring(2, 15), // CSRF protection
    });
    
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('/api/auth/github/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  static async getUserProfile(accessToken: string): Promise<GitHubUser> {
    const response = await fetch(`${this.GITHUB_API_BASE}/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  static async getUserRepositories(accessToken: string
    // ,username: string
  ): Promise<GitHubRepository[]> {
    const response = await fetch(`${this.GITHUB_API_BASE}/user/repos?sort=updated&per_page=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const repos = await response.json();
    
    // Filter out private repos and forks, limit to 50
    return repos
      .filter((repo: GitHubRepository) => !repo.private)
      .slice(0, 50);
  }

  static async getRepositoryLanguages(accessToken: string, fullName: string): Promise<Record<string, number>> {
    const response = await fetch(`${this.GITHUB_API_BASE}/repos/${fullName}/languages`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch languages for ${fullName}`);
      return {};
    }

    return response.json();
  }
}