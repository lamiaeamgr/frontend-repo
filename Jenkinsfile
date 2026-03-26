pipeline {
    agent any

    environment {
        IMAGE_NAME = 'frontend-repo:latest'
        CONTAINER_NAME = 'frontend-repo-container'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'node -v && npm -v'
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build & Run') {
            steps {
                script {
                    def rc = sh(script: 'command -v docker >/dev/null 2>&1', returnStatus: true)
                    if (rc != 0) {
                        echo 'SKIP: Docker not on PATH — install Docker on the Jenkins agent for image build/run.'
                        return
                    }
                    sh """
                        docker build -t ${IMAGE_NAME} .
                        docker rm -f ${CONTAINER_NAME} 2>/dev/null || true
                        docker run -d --name ${CONTAINER_NAME} -p 3000:3000 ${IMAGE_NAME}
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                node(null) {
                    withCredentials([string(credentialsId: 'frontend-slack-webhook', variable: 'SLACK_URL')]) {
                        sh '''
                            curl -sS -X POST -H "Content-type: application/json" \
                              --data '{"text":"Frontend pipeline succeeded."}' \
                              "$SLACK_URL"
                        '''
                    }
                }
            }
        }
        failure {
            script {
                node(null) {
                    withCredentials([string(credentialsId: 'frontend-slack-webhook', variable: 'SLACK_URL')]) {
                        sh '''
                            curl -sS -X POST -H "Content-type: application/json" \
                              --data '{"text":"Frontend pipeline failed."}' \
                              "$SLACK_URL"
                        '''
                    }
                }
            }
        }
    }
}
