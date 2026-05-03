pipeline {
    agent any

    environment {
        ACR_NAME = "ogcccr"
        IMAGE_NAME = "myapp"
        RESOURCE_GROUP = "rg-az104-dev-eus"
        AKS_CLUSTER = "myogcck8scluster"
    }

    stages {

        stage('Clone Code') {
            steps {
                git branch: 'main', url: 'https://github.com/gore-om/Currency-convertor.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $ACR_NAME.azurecr.io/$IMAGE_NAME:latest .'
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
                    echo "Logging into Azure using Service Principal..."

                    az login --service-principal \
                      -u $AZ_CLIENT_ID \
                      -p $AZ_CLIENT_SECRET \
                      --tenant $AZ_TENANT

                    echo "Login successful"

                    az acr login --name $ACR_NAME

                    docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:latest
                    '''
                }
            }
        }

        stage('Deploy to AKS') {
            steps {
                sh '''
                echo "Getting AKS credentials..."

                az aks get-credentials \
                  --resource-group $RESOURCE_GROUP \
                  --name $AKS_CLUSTER \
                  --overwrite-existing

                echo "Deploying to AKS..."

                kubectl apply -f deployment.yaml
                kubectl apply -f service.yaml
                '''
            }
        }
    }
}
