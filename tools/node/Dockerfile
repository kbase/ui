FROM node:20.11.1-bookworm

# Set up
RUN apt-get update && \
    apt-get install -y npm python3 git make bash jq

# Install fixed npm, then all 
RUN npm install --location=global npm@10.5.0
