FROM node:12.16.1-alpine
WORKDIR /app
COPY --chown=node:node . .
RUN npm install --production
USER node
EXPOSE 3000
CMD ["node", "app.js"]
