FROM eclipse-temurin:21-jdk-alpine
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} tomevault.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "tomevault.jar"]