FROM docker.salsitasoft.com/centos7-postgres94:1.0
COPY docker-build-script create-db.sql /
RUN  sh -x -c 'chmod 700 ./docker-build-script && ./docker-build-script'
CMD [ "/opt/bin/postgresd"]
