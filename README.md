# nybbler

…is the name of our project and our team.

Deployed URL: https://nybbler.me/    
Video Demo: 

## Team

- Ian Gregory <ian.gregory@mail.utoronto.ca>
- Gary Chen <thegary.chen@mail.utoronto.ca>
- Martin Loo <martin.loo@mail.utoronto.ca>

## Description

nybbler is a real-time collaborative tool for [software reverse engineering](https://en.wikipedia.org/wiki/Reverse_engineering#Software). Traditionally, SRE hobbyists and professionals rely on tools like [Ghidra](https://ghidra-sre.org/) and [IDA](https://hex-rays.com/) to perform analyses and document their findings. Typical artifacts of the reversing process are symbol names, bookmarks, dissassembly annotations, and source code reconstructions. Our goal is to be the "Google Docs of SRE," allowing multiple reversers to join forces and collaborate on projects in real time.

## Required elements

- Database: PostgreSQL
- Framework: Vue
- Third-party APIs:
  - Upload binary to VirusTotal and retrieve malware scan reports
  - Sync with GitHub
- OAuth2: Sign in with GitHub

## Additional requirements

- "Real-time": Users see each other's edits (to symbol names, inline comments, etc.) as soon as they are made.
- Long-running task: Backend performs decompilation and/or other analyses using existing open-source tools.

## Milestones

The following are the milestones we aim to achieve.

### Alpha

- Users can create projects.
- Users can invite other users to collaborate on their projects.
- Users can add binaries to their projects by file upload.
- When a binary is added, it is analyzed server-side. Users are notified when the process is complete.
- Users can view the results of automated analysis, such as machine code disassembly and symbol list (i.e., names/addresses of functions and global variables).

### Beta

- Users can rename symbols. Changes persist and are propagated to other users in "real time" (5s or less, network conditions notwithstanding).
- Users can add/edit bookmarks, inline comments, and/or other elements as appropriate, to support their analysis and documentation efforts. Changes persist and are propagated in real time.
- Users can authenticate with GitHub.
- Users can choose to send uploaded binaries to VirusTotal for malware scanning. Once complete, the generated report is saved and available for human review.

### Final

- Users can associate manually reconstructed source code with symbols or sections of disassembly.
- Users can import and export projects as downloadable files.
- Users can connect a GitHub repo to any project for periodic sync (backup and restore).
