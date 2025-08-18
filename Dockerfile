FROM jenkins/agent:latest

# root 권한으로 변경
USER root

# Node.js + npm
RUN apt-get update && apt-get install -y curl unzip wget gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

# Amplify CLI
RUN npm install -g @aws-amplify/cli

# yq (yaml parser)
RUN wget https://github.com/mikefarah/yq/releases/download/v4.35.1/yq_linux_amd64 -O /usr/bin/yq \
    && chmod +x /usr/bin/yq

# 다시 jenkins 유저로 전환
USER jenkins

ENTRYPOINT ["/usr/local/bin/jenkins-agent"]
