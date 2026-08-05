import postgres from "postgres";

export interface DbConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password?: string;
}

/**
 * Parses and validates PostgreSQL connection parameters from environment variables with mandated default fallbacks.
 * Enforces validation of numeric port values and rejects malformed configuration.
 * Strictly avoids logging any credentials, connection strings, or secret values.
 */
export function parseAndValidateDbConfig(): DbConfig {
  const host = process.env.PGHOST || "127.0.0.1";

  const rawPort = process.env.PGPORT || "5432";
  const port = parseInt(rawPort, 10);
  if (
    isNaN(port) ||
    port <= 0 ||
    port > 65535 ||
    String(port) !== rawPort.trim()
  ) {
    throw new Error(
      `Invalid PostgreSQL port configuration: "${rawPort}". Port must be a valid numeric value.`,
    );
  }

  const database = process.env.PGDATABASE || "zyppi_test";
  const username = process.env.PGUSER || "zyppi_test";
  const password = process.env.PGPASSWORD || "zyppi_test";

  return {
    host,
    port,
    database,
    username,
    password,
  };
}

/**
 * Creates an instance of a postgres.js client configured with the parsed database properties.
 * All client connection details remain internal to the @zyppi/infra package.
 */
export function createPostgresClient(
  config: DbConfig,
  options: postgres.Options<any> = {},
): postgres.Sql {
  return postgres({
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password,
    onnotice: () => {}, // suppress notice warnings to keep logs clean
    ...options,
  });
}
