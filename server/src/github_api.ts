import { Octokit } from '@octokit/rest';

function getOctokitInstance(token: string) {
  return new Octokit({
    auth: token,
  });
}

export async function getRepos(token: string) {
  const octokit = getOctokitInstance(token);
  const repos = await octokit.request('GET /user/repos', {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  return repos;
}

export async function getGitHubRepo(token: string, owner: string, repo: string) {
  const octokit = getOctokitInstance(token);
  const response = await octokit.repos.get({ owner, repo });
  return response.data;
}

export async function getGitHubBranch(token: string, owner: string, repo: string, branch: string) {
  const octokit = getOctokitInstance(token);
  const response = await octokit.repos.getBranch({ owner, repo, branch });
  return response.data;
}

export async function uploadFileToGitHub(token: string, owner: string, repo: string, fileContent: Buffer) {
  const octokit = getOctokitInstance(token);

  const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo,
    path: 'nybbler.zip'
  });
  const sha = response.data.sha;

  await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: owner,
    repo: repo,
    path: 'nybbler.zip',
    message: 'my commit message',
    content: fileContent.toString('base64'),
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
}

export async function downloadFileFromGitHub(token: string, owner: string, repo: string, branch: string, filePath: string) {
  const octokit = getOctokitInstance(token);

  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });

  const commitSha = refData.object.sha;

  const { data: commitData } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: commitSha,
  });

  const { data: treeData } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: commitData.tree.sha,
    recursive: 'true',
  });

  const fileBlob = treeData.tree.find((file) => file != null);

  if (!fileBlob) {
    throw new Error('File not found in repository.');
  }

  const { data: blobData } = await octokit.git.getBlob({
    owner,
    repo,
    file_sha: fileBlob.sha,
  });

  const content = Buffer.from(blobData.content, 'base64');
  return content;
}
