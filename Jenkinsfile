pipeline {
    agent any

    environment {
        // Define global environment variables if needed
        DOCKER_REGISTRY = "viru0909" 
        APP_NAME = "nyaysetu"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Parallel Build & Test') {
            parallel {
                stage('Backend Build') {
                    steps {
                        dir('backend/nyaysetu-backend') {
                            sh 'chmod +x mvnw'
                            sh './mvnw clean package -DskipTests=false'
                        }
                    }
                    post {
                        always {
                            junit 'backend/nyaysetu-backend/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('Frontend Build') {
                    steps {
                        dir('frontend/nyaysetu-frontend') {
                            sh 'npm install'
                            sh 'npm run build'
                            // Add test command if available: sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend/nyaysetu-backend') {
                            script {
                                docker.build("${DOCKER_REGISTRY}/${APP_NAME}-backend:${env.BUILD_NUMBER}")
                                // docker.build("${DOCKER_REGISTRY}/${APP_NAME}-backend:latest")
                            }
                        }
                    }
                }

                stage('Build Frontend Image') {
                    steps {
                        dir('frontend/nyaysetu-frontend') {
                            script {
                                docker.build("${DOCKER_REGISTRY}/${APP_NAME}-frontend:${env.BUILD_NUMBER}")
                                // docker.build("${DOCKER_REGISTRY}/${APP_NAME}-frontend:latest")
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline successfully completed.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
