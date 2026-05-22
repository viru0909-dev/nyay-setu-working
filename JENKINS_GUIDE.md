# Jenkins CI/CD Setup Guide for Nyay Saarthi

This guide walks you through setting up the Jenkins pipeline for the Nyay Saarthi project using the `Jenkinsfile` located in the root directory.

<hr/>

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Creating the Pipeline Job](#creating-the-pipeline-job)
3. [Configuring the Job](#configuring-the-job)
4. [Running the Build](#running-the-build)
5. [Artifacts & Reports](#artifacts--reports)
6. [Troubleshooting](#troubleshooting)

<hr/>

## 1. Prerequisites

Before creating the job, ensure your Jenkins instance has the following plugins installed:
- **Docker Pipeline**: For building and pushing Docker images.
- **NodeJS Plugin**: For building the frontend.
- **Pipeline: Declarative**: For processing the `Jenkinsfile`.
- **Git Plugin**: For cloning the repository.

### Global Tool Configuration
Navigate to `Manage Jenkins` -> `Tools`:
1. **NodeJS**: Add a Node.js installation (e.g., name it `node-18`) so the pipeline can use it.
2. **Maven**: Ensure Maven is configured or use the wrapper (`mvnw`) included in the project (recommended).

<hr/>

## 2. Creating the Pipeline Job

1. From the Jenkins dashboard, click **New Item**.
2. **Name**: Enter a name (e.g., `nyaysetu-pipeline`).
3. **Type**: Select **Multibranch Pipeline** (recommended for GitHub integration) or **Pipeline**.
4. Click **OK**.

<hr/>

## 3. Configuring the Job

### For Multibranch Pipeline (Recommended):
1. **Branch Sources**: Click **Add source** -> **GitHub**.
2. **Credentials**: Select your GitHub credentials (or add them).
3. **Repository HTTPS URL**: Enter `https://github.com/viru0909-dev/nyay-setu-working.git`.
4. Click **Save**.
5. Jenkins will automatically verify the repository and scan for the `Jenkinsfile`.

### For Single Pipeline:
1. **Definition**: Select **Pipeline script from SCM**.
2. **SCM**: Select **Git**.
3. **Repository URL**: `https://github.com/viru0909-dev/nyay-setu-working.git`.
4. **Branch Specifier**: `*/main`.
5. **Script Path**: `Jenkinsfile`.
6. Click **Save**.

<hr/>

## 4. Running the Build

1. Click **Build Now** (or **Scan Multibranch Pipeline Now**).
2. Monitor the stages:
   - **Checkout**: Clones the code.
   - **Parallel Build**:
     - **Backend**: Runs `./mvnw clean package`. Tests are executed and reported.
     - **Frontend**: Runs `npm install` and `npm run build`.
   - **Docker Build**: Builds the images.

<hr/>

## 5. Artifacts & Reports

- **Test Results**: Check the "Test Result" trend graph on the job page to see backend JUnit test results.
- **Docker Images**: If the Docker registry is configured in the environment variables, images will be pushed automatically.

<hr/>

## 6. Troubleshooting

| Issue | Solution |
|---|---|
| **Permission Denied (`mvnw`)** | The pipeline includes `chmod +x mvnw` to fix execution permissions. Ensure this step completes successfully. |
| **Node Not Found** | Ensure the `frontend` stage has the correct NodeJS tool configured in Jenkins if `npm` is not in the global path. |
