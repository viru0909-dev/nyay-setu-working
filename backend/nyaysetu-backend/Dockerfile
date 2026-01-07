# Build Stage
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Port for Render
EXPOSE 8080

# Use exec form to allow signal passing and argument appending
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
