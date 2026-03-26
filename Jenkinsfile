pipeline {
  agent any

  environment {
    IMAGE_NAME = "frontend-repo:latest"
    CONTAINER_NAME = "frontend-repo-container"
    SLACK_WEBHOOK_URL = credentials('frontend-slack-webhook')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build App') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $IMAGE_NAME .'
      }
    }

    stage('Run Container') {
      steps {
        sh '''
          docker rm -f $CONTAINER_NAME || true
          docker run -d --name $CONTAINER_NAME -p 3000:3000 $IMAGE_NAME
        '''
      }
    }
  }

  post {
    success {
      sh '''
        curl -X POST -H "Content-type: application/json" \
        --data '{"text":"Frontend pipeline succeeded."}' \
        $SLACK_WEBHOOK_URL
      '''
    }
    failure {
      sh '''
        curl -X POST -H "Content-type: application/json" \
        --data '{"text":"Frontend pipeline failed."}' \
        $SLACK_WEBHOOK_URL
      '''
    }
  }
}
