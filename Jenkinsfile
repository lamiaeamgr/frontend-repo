pipeline {
    agent any

    environment {
        IMAGE_NAME = 'frontend-repo:latest'
        CONTAINER_NAME = 'frontend-repo-container'
        // Used only if the agent has no system Node — Linux x64 tarball (matches typical Jenkins-in-Docker).
        NODE_VERSION = '20.18.1'
        // Must match Manage Jenkins → SonarQube servers → Name (case-sensitive). Change to your exact name, often "SonarQube".
        SONARQUBE_SERVER_NAME = 'SonarQube'
    }

    stages {
        // Declarative already checks out SCM once; avoid a duplicate Checkout stage.

        stage('Prepare Node toolchain') {
            steps {
                sh '''
                    set -eux
                    command -v curl >/dev/null 2>&1 || { echo "Install curl on the agent."; exit 1; }
                    NROOT="${WORKSPACE}/.jenkins-node"
                    NODE_HOME="${NROOT}/node-v${NODE_VERSION}-linux-x64"
                    mkdir -p "${NROOT}"
                    if [ ! -x "${NODE_HOME}/bin/node" ]; then
                        # .tar.gz uses gzip (usually present); .tar.xz needs xz, often missing on slim Jenkins images.
                        curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" \
                            -o "/tmp/node-${NODE_VERSION}.tar.gz"
                        tar -xzf "/tmp/node-${NODE_VERSION}.tar.gz" -C "${NROOT}"
                    fi
                    echo "export NODE_HOME=\"${NODE_HOME}\"" > "${WORKSPACE}/.jenkins-node-env"
                    echo "export PATH=\"${NODE_HOME}/bin:\$PATH\"" >> "${WORKSPACE}/.jenkins-node-env"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -eux
                    . "${WORKSPACE}/.jenkins-node-env"
                    node -v && npm -v
                    npm ci
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    set -eux
                    . "${WORKSPACE}/.jenkins-node-env"
                    npm test
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    set -eux
                    . "${WORKSPACE}/.jenkins-node-env"
                    npm run build
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${env.SONARQUBE_SERVER_NAME}") {
                    script {
                        def scannerCmd
                        try {
                            def scannerHome = tool 'SonarQubeScanner'
                            scannerCmd = "${scannerHome}/bin/sonar-scanner"
                        } catch (Throwable ignored) {
                            echo 'SonarQubeScanner tool not defined in Jenkins; trying sonar-scanner on PATH.'
                            def rc = sh(script: 'command -v sonar-scanner >/dev/null 2>&1', returnStatus: true)
                            if (rc != 0) {
                                error '''Sonar scanner missing. Add Manage Jenkins → Tools → SonarQube Scanner (Name: SonarQubeScanner), or install sonar-scanner on the agent.'''
                            }
                            scannerCmd = 'sonar-scanner'
                        }
                        sh """
                            set -eux
                            . "\${WORKSPACE}/.jenkins-node-env"
                            "${scannerCmd}"
                        """
                    }
                }
            }
        }

        stage('Docker Build & Run') {
            steps {
                script {
                    def rc = sh(script: 'command -v docker >/dev/null 2>&1', returnStatus: true)
                    if (rc != 0) {
                        echo 'SKIP: Docker not on PATH — install Docker on the agent for image build/run.'
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
                try {
                    node(null) {
                        withCredentials([string(credentialsId: 'frontend-slack-webhook', variable: 'SLACK_URL')]) {
                            sh '''
                                curl -sS -X POST -H "Content-type: application/json" \
                                  --data '{"text":"Frontend pipeline succeeded."}' \
                                  "$SLACK_URL"
                            '''
                        }
                    }
                } catch (ignored) {
                    echo 'Slack: skipped (add credential ID frontend-slack-webhook as Secret text, or ignore).'
                }
            }
        }
        failure {
            script {
                try {
                    node(null) {
                        withCredentials([string(credentialsId: 'frontend-slack-webhook', variable: 'SLACK_URL')]) {
                            sh '''
                                curl -sS -X POST -H "Content-type: application/json" \
                                  --data '{"text":"Frontend pipeline failed."}' \
                                  "$SLACK_URL"
                            '''
                        }
                    }
                } catch (ignored) {
                    echo 'Slack: skipped (add credential ID frontend-slack-webhook as Secret text, or ignore).'
                }
            }
        }
    }
}
