import { useState, useCallback } from 'react';
import { GitHubOAuthService } from '@/lib/services/github-oauth';

export interface GitHubIntegrationData {
  user: any;
  repositories: any[];
  skills: {
    programmingLanguages: string[];
    frameworks: string[];
  };
  accessToken: string; // ADD THIS
}

export function useGitHubIntegration() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GitHubIntegrationData | null>(null);
  
  const connectGitHub = useCallback(() => {
    setIsConnecting(true);
    setError(null);
    
    // Store the current URL to return to after OAuth
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('githubOAuthReturn', window.location.href);
      
      // Redirect to GitHub OAuth
      window.location.href = GitHubOAuthService.getAuthUrl();
    }
  }, []);
  
  const handleOAuthCallback = useCallback(async (code: string) => {
    setIsConnecting(false);
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Exchange code for access token
      const accessToken = await GitHubOAuthService.exchangeCodeForToken(code);
      
      // Get user profile
      const user = await GitHubOAuthService.getUserProfile(accessToken);
      
      // Get user repositories
      const repositories = await GitHubOAuthService.getUserRepositories(accessToken);
      
      // Analyze repositories for skills
      const skills = await analyzeRepositoriesForSkills(accessToken, repositories);
      
      // Store access token securely (in production, encrypt this)
      if (typeof window !== 'undefined') {
        localStorage.setItem('github_access_token', accessToken);
        localStorage.setItem('github_user', JSON.stringify(user));
      }
      
      const integrationData: GitHubIntegrationData = {
        user,
        repositories,
        skills,
        accessToken, // ← ADDED THIS
      };
      
      setData(integrationData);
      setIsAnalyzing(false);
      
      return integrationData;
    } catch (err) {
      console.error('GitHub integration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to integrate with GitHub');
      setIsAnalyzing(false);
      throw err;
    }
  }, []);
  
  const analyzeRepositoriesForSkills = async (
    accessToken: string,
    repositories: any[]
  ): Promise<{ programmingLanguages: string[]; frameworks: string[] }> => {
    const languageCount: Record<string, number> = {};
    const frameworkCount: Record<string, number> = {};
    
    // Framework/tool detection patterns
    const frameworkPatterns: Record<string, RegExp[]> = {
      'React': [/react/i, /jsx/i, /\.jsx$/i],
      'Vue': [/vue/i, /\.vue$/i],
      'Angular': [/angular/i, /@angular/i],
      'Node.js': [/node/i, /nodejs/i, /express/i],
      'Django': [/django/i, /requirements\.txt/i],
      'Flask': [/flask/i],
      'Spring': [/spring/i, /\.java$/i],
      'Docker': [/docker/i, /dockerfile/i],
      'Kubernetes': [/k8s/i, /kubernetes/i],
      'Next.js': [/next/i, /nextjs/i],
      'TensorFlow': [/tensorflow/i, /tf/i],
      'PyTorch': [/pytorch/i, /torch/i],
    };
    
    for (const repo of repositories.slice(0, 20)) { // Analyze top 20 repos
      try {
        // Get language statistics
        const languages = await GitHubOAuthService.getRepositoryLanguages(accessToken, repo.full_name);
        
        // Count languages
        Object.keys(languages).forEach(lang => {
          languageCount[lang] = (languageCount[lang] || 0) + languages[lang];
        });
        
        // Detect frameworks from repo name, description, and topics
        const searchText = `${repo.name} ${repo.description || ''} ${repo.topics?.join(' ') || ''}`.toLowerCase();
        
        Object.entries(frameworkPatterns).forEach(([framework, patterns]) => {
          if (patterns.some(pattern => pattern.test(searchText))) {
            frameworkCount[framework] = (frameworkCount[framework] || 0) + 1;
          }
        });
      } catch (err) {
        console.warn(`Failed to analyze repo ${repo.name}:`, err);
      }
    }
    
    // Get top languages and frameworks
    const programmingLanguages = Object.entries(languageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([lang]) => lang);
    
    const frameworks = Object.entries(frameworkCount)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([framework]) => framework);
    
    return { programmingLanguages, frameworks };
  };
  
  return {
    isConnecting,
    isAnalyzing,
    error,
    data,
    connectGitHub,
    handleOAuthCallback,
  };
}