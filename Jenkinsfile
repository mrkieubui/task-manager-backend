pipeline {
    agent any

    environment {
        // Tên image trên Docker Hub
        DOCKER_IMAGE = 'mrkieubui/task-manager-backend:v1.0'
        // ID Credential đã tạo ở Bước 1
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Tải code mới nhất từ Bitbucket
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Tag image với ID của lượt build (BUILD_NUMBER) và tag 'latest'
                    echo "Building Docker Image..."
                    sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} -t ${DOCKER_IMAGE}:latest ."
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // Đăng nhập Docker Hub và push image
                    echo "Pushing Docker Image to Docker Hub..."
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin"
                        sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Dọn dẹp image local sau khi build xong để tiết kiệm dung lượng ổ cứng Server
                sh "docker rmi ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest || true"
            }
        }
        success {
            echo 'Build và Push Docker Image thành công!'
        }
        failure {
            echo 'Pipeline bị lỗi, hãy kiểm tra lại log.'
        }
    }
}