# Dockerfile for Blackjack Web Application
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml from java-web-wrapper directory
COPY java-web-wrapper/mvnw .
COPY java-web-wrapper/.mvn .mvn
COPY java-web-wrapper/pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY java-web-wrapper/src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/blackjack-web-1.0.0.jar"]
