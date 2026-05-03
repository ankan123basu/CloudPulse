pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO = 'ankan0210/cloudpulse'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/ankan123basu/cloudpulse-devops.git'
            }
        }

        stage('Maven Build & Test') {
            steps {
                sh 'mvn clean package'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t ${DOCKER_HUB_REPO}:latest .'
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds',
                  usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh 'docker login -u $USER -p $PASS'
                    sh 'docker push ${DOCKER_HUB_REPO}:latest'
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'docker stop cloudpulse-app || true'
                sh 'docker rm cloudpulse-app || true'
                sh 'docker run -d --name cloudpulse-app -p 8080:8080 ${DOCKER_HUB_REPO}:latest'
            }
        }
    }

    post {
        success {
            echo '✅ CloudPulse deployed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs above.'
        }
    }
}
