FROM pryv/base:1.3.38
LABEL maintainer="tech@pryv.com"

ADD . /pd_build
RUN /pd_build/install.sh

# Ports:
#   9000        service-mfa API
#
EXPOSE 9000
