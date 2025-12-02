# Dockerfile for user-verification-service - ARM64-ready
ARG BUILD_IMAGE=maven:3.9-eclipse-temurin-17
ARG RUNTIME_IMAGE=eclipse-temurin:17-jre

# Build stage
FROM --platform=$BUILDPLATFORM ${BUILD_IMAGE} AS builder
WORKDIR /app

ARG MAVEN_CONFIG="/root/.m2"
ENV MAVEN_CONFIG=${MAVEN_CONFIG}

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn -B -DskipTests package

# Runtime stage - ARM64 optimized
FROM --platform=linux/arm64 ${RUNTIME_IMAGE} AS runtime
WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=builder /app/target/*.jar app.jar

USER app
EXPOSE 8087

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]
