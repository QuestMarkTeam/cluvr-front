pipeline {
    agent any

    environment {
        AWS_REGION = 'us-west-2'
        AWS_ACCOUNT_ID = '617373894870'
        ECR_REPO = 'cluvr-front'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        S3_BUCKET = 'cluvr-front'
        CLOUD_FRONT_ID = 'your-cloudfront-id'
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/your/repo.git', branch: 'main'
            }
        }

        stage('Build React App') {
            steps {
                script {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build and Push to ECR') {
            steps {
                script {
                    sh 'docker build -t react-app .'
                    sh 'docker tag react-app:latest ${ECR_REPO}:latest'
                    sh 'docker push ${ECR_REPO}:latest'
                }
            }
        }

        stage('Upload to S3') {
            steps {
                script {
                    sh 'aws s3 sync ./build s3://${S3_BUCKET} --delete'
                }
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
                script {
                    sh 'aws cloudfront create-invalidation --distribution-id ${CLOUD_FRONT_ID} --paths "/*"'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment to S3 + CloudFront was successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
