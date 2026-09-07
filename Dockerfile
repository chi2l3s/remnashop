FROM node:24-alpine AS webapp-builder
WORKDIR /opt/remnashop/webapp
COPY webapp/package.json webapp/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY webapp/ ./
RUN npm run build

FROM ghcr.io/astral-sh/uv:python3.12-alpine AS builder
WORKDIR /opt/remnashop
RUN apk add --no-cache git
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --compile-bytecode \
    && rm -rf .venv/lib/python3.12/site-packages/{pip,setuptools,wheel}*

FROM python:3.12-alpine AS final
WORKDIR /opt/remnashop

ARG BUILD_TIME
ARG BUILD_BRANCH
ARG BUILD_COMMIT
ARG BUILD_TAG

ENV BUILD_TIME=${BUILD_TIME}
ENV BUILD_BRANCH=${BUILD_BRANCH}
ENV BUILD_COMMIT=${BUILD_COMMIT}
ENV BUILD_TAG=${BUILD_TAG}

RUN apk add --no-cache postgresql-client

COPY --from=builder /opt/remnashop/.venv /opt/remnashop/.venv
ENV PATH="/opt/remnashop/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/opt/remnashop

COPY ./src ./src
COPY ./assets /opt/remnashop/assets.default
COPY --from=webapp-builder /opt/remnashop/webapp/dist ./webapp/dist

COPY ./docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
CMD ["./docker-entrypoint.sh"]
