import { Octokit } from "@octokit/rest";

// Create octokit instance with user access token for usage with Github API
function getOctokitInstance(token: string) {
  return new Octokit({
    auth: token,
  });
}

// Github API request to get repos
export async function getRepos(token: string) {
  const octokit = getOctokitInstance(token);
  const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser);
  return repos;
}

// Make a request to Github API to upload filepath zip
export async function uploadFileToGitHub(
  token: string,
  owner: string,
  repo: string,
  filepath: string,
  fileContent: Buffer,
) {
  const octokit = getOctokitInstance(token);

  let sha;
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path: filepath,
    });
    if (response) sha = response.data.sha;
  } catch {
    sha = null;
  }

  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: owner,
    repo: repo,
    path: filepath,
    message: "Upload project zip",
    content: fileContent.toString("base64"),
    sha: sha || undefined,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}

// Make a request to Github API to download filepath zip
export async function downloadFileFromGitHub(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
) {
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
    recursive: "true",
  });

  const fileBlob = treeData.tree.find((file) => file.path === filePath);

  if (!fileBlob) {
    throw new Error("File not found in repository.");
  }

  const { data: blobData } = await octokit.git.getBlob({
    owner,
    repo,
    file_sha: fileBlob.sha,
  });

  const content = Buffer.from(blobData.content, "base64");
  return content;
}
