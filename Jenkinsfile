pipeline {
    agent any

    environment {
        AWS_REGION = 'us-west-2'
        AWS_ACCOUNT_ID = '617373894870'
        ECR_REPO = 'cluvr-front'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        S3_BUCKET = 'cluvr-front'
        CLOUD_FRONT_ID = 'E94ASMOKGZWOG'
        IMAGE_TAG = 'latest'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                cleanWs()
                echo "✅ Checking out source code from GitHub..."
                checkout scm
            }
        }

        stage('Build React App') {
            steps {
                script {
                    echo "Building the React app..."
                    // Docker를 사용하여 React 앱 빌드
                    sh 'docker build -t react-app .'
                }
            }
        }

        stage('Upload to S3') {
            steps {
                script {
                    echo "Uploading build to S3..."
                    // Docker 컨테이너 내의 build 디렉토리에서 빌드된 파일을 S3로 업로드
                    sh 'docker run --rm -v $(pwd)/build:/app/build amazon/aws-cli s3 sync /app/build s3://${S3_BUCKET} --delete'
                }
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
                script {
                    echo "Invalidating CloudFront cache..."
                    // CloudFront 캐시 무효화
                    sh 'aws cloudfront create-invalidation --distribution-id ${CLOUD_FRONT_ID} --paths "/*"'
                }
            }
        }

        stage('Docker Build and Push to ECR') {
            steps {
                script {
                    echo "Building Docker image and pushing to ECR..."
                    // Docker 이미지를 ECR로 푸시
                    sh 'docker build -t react-app .'
                    sh 'docker tag react-app:latest ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}'
                    sh 'docker push ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}'
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
