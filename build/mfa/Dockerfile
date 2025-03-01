FROM docker.io/pryvio/base:1.8.1
MAINTAINER "Tech@Pryv" <tech@pryv.com>

ARG TARGET_DIR="/app/bin"
ARG CONF_DIR="/app/conf"
ARG LOG_DIR="/app/log"

# pass building name as an argument (like core,previews or other)
ARG COMPONENT_NAME
ENV COMPONENT_NAME=$COMPONENT_NAME

# copy all code to the target dir except files mentioned in .dockerignore
COPY . $TARGET_DIR
WORKDIR $TARGET_DIR

# Skipping this as it's done in GitHub workflow
#RUN just install

# Copy config file
RUN mkdir -p $CONF_DIR && \
	cp $TARGET_DIR/build/$COMPONENT_NAME/config/$COMPONENT_NAME.json $CONF_DIR/$COMPONENT_NAME.json

# Create the logs directory and related files
RUN mkdir -p $LOG_DIR && \
    touch $LOG_DIR/$COMPONENT_NAME.log && chown -R app:app $LOG_DIR

# ============================ start runit ================================
# Install the script that runs the api service
RUN mkdir -p /etc/runit/ && mkdir -p /etc/service/runit/
RUN cp -r $TARGET_DIR/build/$COMPONENT_NAME/runit/* /etc/runit/
RUN mv /etc/runit/runit.sh /etc/init.d/

# make a link to /etc/service (will be run with runit).
RUN ln -s /etc/init.d/runit.sh /etc/service/runit/run
# ============================ end runit ================================

# Remove cron and sshd entirely, unless we use them
RUN rm -r /etc/service/cron
RUN rm -r /etc/service/sshd && rm /etc/my_init.d/00_regen_ssh_host_keys.sh

# Clean up after ourselves.
RUN apt-get remove -y autoconf automake
RUN apt-get autoremove && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* & rm -rf /app/bin/build

# Ports:
#   9000        MFA API
#
EXPOSE 9000
