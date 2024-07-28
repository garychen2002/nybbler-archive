import { Octokit } from '@octokit/rest';


function getOctokitInstance(token: string) {
  return new Octokit({
    auth: token,
  });
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

export async function uploadFileToGitHub(token: string, owner: string, repo: string, branch: string, filePath: string, fileContent: Buffer) {
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

  // GPT
  const { data: treeData } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: commitData.tree.sha,
    tree: [
      {
        path: filePath,
        mode: '100644',
        type: 'blob',
        content: fileContent.toString('base64'),
        encoding: 'base64',
      },
    ],
  });

  const { data: newCommitData } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'Upload project zip file',
    tree: treeData.sha,
    parents: [commitSha],
  });

  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommitData.sha,
  });
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

  const fileBlob = treeData.tree.find((file) => file.path === filePath);

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
