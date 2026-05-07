pipeline {
    agent any

    environment {
        ACR_NAME = "ogccr"
        IMAGE_NAME = "currency-app"
        RESOURCE_GROUP = "rg-az104-dev-eus"
        AKS_CLUSTER = "myogcck8scluster"
    }

    stages {

        stage('Clone Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/gore-om/Currency-convertor.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $ACR_NAME.azurecr.io/$IMAGE_NAME:latest .
                '''
            }
        }

        stage('Azure Login & Push to ACR') {
            steps {

                withCredentials([
                    string(credentialsId: 'azure-client-id', variable: 'AZ_CLIENT_ID'),
                    string(credentialsId: 'azure-client-secret', variable: 'AZ_CLIENT_SECRET'),
                    string(credentialsId: 'azure-tenant-id', variable: 'AZ_TENANT')
                ]) {

                    sh '''
                    echo "Azure Login..."

                    az login --service-principal \
                      -u $AZ_CLIENT_ID \
                      -p $AZ_CLIENT_SECRET \
                      --tenant $AZ_TENANT

                    echo "ACR Login..."

                    az acr login --name $ACR_NAME

                    echo "Pushing Docker Image..."

                    docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:latest
                    '''
                }
            }
        }

        stage('Deploy to AKS') {
            steps {

                sh '''
                echo "Getting AKS Credentials..."

                az aks get-credentials \
                  --resource-group $RESOURCE_GROUP \
                  --name $AKS_CLUSTER \
                  --overwrite-existing

                echo "Deploying Kubernetes Resources..."

                kubectl apply -f deployment.yaml
                kubectl apply -f service.yaml
                kubectl apply -f ingress.yaml
                '''
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                docker rmi $ACR_NAME.azurecr.io/$IMAGE_NAME:latest || true
                '''
            }
        }
    }
}
