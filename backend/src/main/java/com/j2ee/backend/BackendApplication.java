package com.j2ee.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		loadLocalEnv();

		SpringApplication.run(BackendApplication.class, args);
	}

	private static void loadLocalEnv() {
		// Prefer backend/.env, then fallback to ../.env when running from backend
		// module.
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		if (dotenv.entries().iterator().hasNext() == false) {
			dotenv = Dotenv.configure().directory("..").ignoreIfMissing().load();
		}

		dotenv.entries().forEach(entry -> {
			if (System.getProperty(entry.getKey()) == null) {
				System.setProperty(entry.getKey(), entry.getValue());
			}
		});
	}

}
