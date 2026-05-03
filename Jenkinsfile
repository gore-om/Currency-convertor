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
                git 'https://github.com/gore-om/Currency-convertor.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $ACR_NAME.azurecr.io/$IMAGE_NAME:latest .'
            }
        }

        stage('Push to ACR') {
            steps {
                sh '''
                az acr login --name $ACR_NAME
                docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:latest
                '''
            }
        }

        stage('Deploy to AKS') {
            steps {
                sh '''
                az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER --overwrite-existing
                kubectl apply -f deployment.yaml
                kubectl apply -f service.yaml
                '''
            }
        }
    }
}
