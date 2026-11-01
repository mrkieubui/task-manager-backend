pipeline {
    agent any

    environment {
        REGISTRY_IMAGE = 'mrkieubui/task-manager-backend'
        DOCKER_CRED_ID = 'docker-hub-credentials'
        
        // Sửa cú pháp tag: Dùng dấu gạch ngang (-) hoặc chấm (.) thay vì hai chấm (:)
        // IMAGE_TAG = "v1.0-${BUILD_NUMBER}" // Tạo ra tag hợp lệ dạng: mrkieubui/task-manager-backend:v1.0-1
        IMAGE_TAG = "v1.0" // Tạo ra tag hợp lệ dạng: mrkieubui/task-manager-backend:v1.0-1
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker Image: ${REGISTRY_IMAGE}:${IMAGE_TAG}"
                    dockerImage = docker.build("${REGISTRY_IMAGE}:${IMAGE_TAG}", "--cache-from ${REGISTRY_IMAGE}:latest -f Dockerfile .")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CRED_ID) {
                        echo "Pushing image tag: ${IMAGE_TAG}"
                        dockerImage.push("${IMAGE_TAG}")

                        if (env.BRANCH_NAME == 'main' || env.GIT_BRANCH == 'origin/main') {
                            echo "Pushing image tag: latest"
                            dockerImage.push("latest")
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                sh "docker rmi ${REGISTRY_IMAGE}:${IMAGE_TAG} || true"
                if (env.BRANCH_NAME == 'main' || env.GIT_BRANCH == 'origin/main') {
                    sh "docker rmi ${REGISTRY_IMAGE}:latest || true"
                }
            }
        }
        success {
            echo "CI completed successfully for ${REGISTRY_IMAGE}:${IMAGE_TAG}."
        }
        failure {
            echo "CI failed. Check logs for details."
        }
    }
}