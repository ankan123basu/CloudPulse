# ================================
# Stage 1: Build with Maven
# ================================
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# ================================
# Stage 2: Run lightweight image
# ================================
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/cloudpulse-1.0.0.jar app.jar
EXPOSE 8080

# Health check runs curl every 30 seconds
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
