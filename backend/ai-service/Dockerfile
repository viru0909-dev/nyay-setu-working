# Dockerfile for ai-service - ARM64-ready
ARG BUILD_IMAGE=maven:3.9-eclipse-temurin-17
ARG RUNTIME_IMAGE=eclipse-temurin:17-jre

# Build stage
FROM --platform=$BUILDPLATFORM ${BUILD_IMAGE} AS builder
WORKDIR /build

ARG MAVEN_CONFIG="/root/.m2"
ENV MAVEN_CONFIG=${MAVEN_CONFIG}

# Copy parent POM first
COPY pom.xml ./pom.xml

# Copy service POM and download dependencies
COPY ai-service/pom.xml ./ai-service/pom.xml
WORKDIR /build/ai-service
RUN mvn dependency:go-offline -B || true

# Copy source code
COPY ai-service/src ./src

# Build the application
RUN mvn -B -DskipTests package

# Runtime stage - ARM64 optimized
FROM --platform=linux/arm64 ${RUNTIME_IMAGE} AS runtime
WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=builder /build/ai-service/target/*.jar app.jar

USER app
EXPOSE 8085

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]
