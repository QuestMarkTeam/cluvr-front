pipeline {
    agent any

    environment {
        AWS_REGION = 'us-west-2'
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
                    sh 'npm run build'
                }
            }
        }

        stage('Upload to S3') {
            steps {
                script {
                    echo "Uploading build to S3..."
                    sh 'aws s3 sync ./build s3://${S3_BUCKET} --delete'
                }
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
                script {
                    echo "Invalidating CloudFront cache..."
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
