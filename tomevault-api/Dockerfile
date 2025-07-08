FROM openjdk:21-jdk
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} tomevault.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "tomevault.jar"]