pipeline {
    agent any

    environment {
        AWS_REGION = 'us-west-2'
        AWS_ACCOUNT_ID = '617373894870'
        S3_BUCKET = 'cluvr-front'
        CLOUD_FRONT_ID = 'E94ASMOKGZWOG'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                cleanWs()
                echo "✅ Checking out source code from GitHub..."
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo "Installing dependencies..."
                    sh 'npm install'
                }
            }
        }

        stage('Build React App') {
            steps {
                script {
                    echo "Building the React app..."
                    // 빌드 과정
                    sh 'npm run build'
                }
            }
        }

         stage('Upload to S3') {
             steps {
                 script {
                     echo "Uploading build to S3..."
                     // 빌드된 파일이 dist/ 폴더에 생성되므로 해당 경로를 S3로 업로드
                     sh 'aws s3 sync ./dist/ s3://${S3_BUCKET}/dist/ --delete'
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
