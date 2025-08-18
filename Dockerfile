FROM jenkins/agent:latest

# Node.js + npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install

# Amplify CLI
RUN npm install -g @aws-amplify/cli

# yq (yaml parser)
RUN wget https://github.com/mikefarah/yq/releases/download/v4.35.1/yq_linux_amd64 -O /usr/bin/yq \
    && chmod +x /usr/bin/yq

ENTRYPOINT ["/usr/local/bin/jenkins-agent"]