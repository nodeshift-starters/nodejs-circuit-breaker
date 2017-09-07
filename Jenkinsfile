node("launchpad-nodejs") {
  checkout scm
  stage("Build") {
    sh "cd name-service && npm install && cd ../greeting-service && npm install"
  }
  stage("Deploy") {
    sh "cd name-service && npm run openshift && cd ../greeting-service && npm run openshift"
  }
}
