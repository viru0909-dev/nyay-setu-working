# Jenkins CI/CD Setup Guide for NyaySetu

This guide walks you through setting up the Jenkins pipeline for the NyaySetu project using the `Jenkinsfile` created in the root directory.

## 1. Prerequisites

Before creating the job, ensure your Jenkins instance has the following plugins installed:
-   **Docker Pipeline**: For building and pushing Docker images.
-   **NodeJS Plugin**: For building the frontend.
-   **Pipeline: Declarative**: For processing the `Jenkinsfile`.
-   **Git Plugin**: For cloning the repository.

### Global Tool Configuration
Go to `Manage Jenkins` -> `Tools`:
1.  **NodeJS**: Add a Node.js installation (e.g., name it `node-18`) so the pipeline can use it.
2.  **Maven**: Ensure Maven is configured or use the wrapper (`mvnw`) included in the project (recommended).

## 2. Creating the Pipeline Job

1.  **New Item**: From the Jenkins dashboard, click **New Item**.
2.  **Name**: Enter a name (e.g., `nyaysetu-pipeline`).
3.  **Type**: Select **Multibranch Pipeline** (recommended for GitHub integration) or **Pipeline**.
4.  **Click Open**.

## 3. Configuring the Job

### For Multibranch Pipeline (Recommended):
1.  **Branch Sources**: Click **Add source** -> **GitHub**.
2.  **Credentials**: Select your GitHub credentials (or add them).
3.  **Repository HTTPS URL**: Enter `https://github.com/viru0909-dev/nyay-setu-working.git`.
4.  **Save**.
5.  Jenkins will verify the repository and scan for the `Jenkinsfile`.

### For Single Pipeline:
1.  **Definition**: Select **Pipeline script from SCM**.
2.  **SCM**: Select **Git**.
3.  **Repository URL**: `https://github.com/viru0909-dev/nyay-setu-working.git`.
4.  **Branch Specifier**: `*/main`.
5.  **Script Path**: `Jenkinsfile`.
6.  **Save**.

## 4. Running the Build

1.  Click **Build Now** (or **Scan Multibranch Pipeline Now**).
2.  Monitoring the stages:
    -   **Checkout**: Clones the code.
    -   **Parallel Build**:
        -   **Backend**: Runs `./mvnw clean package`. Tests are executed and reported.
        -   **Frontend**: Runs `npm install` and `npm run build`.
    -   **Docker Build**: builds the images.

## 5. Artifacts & Reports

-   **Test Results**: Check the "Test Result" trend graph on the job page to see backend JUnit test results.
-   **Docker Images**: If the Docker registry is configured in the environment variables, images will be pushed.

## Troubleshooting

-   **Permission Denied**: If `mvnw` fails, the pipeline includes `chmod +x mvnw` to fix permissions.
-   **Node Not Found**: Ensure the `frontend` stage has the correct NodeJS tool configured if `npm` is not in the global path.
